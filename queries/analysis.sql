-- ClickSense PostHog Analysis Playbook
-- ======================================
-- HogQL queries for analyzing click_confidence events from Scrutinizer.
-- Run in PostHog SQL editor (https://us.posthog.com → SQL).
--
-- Queries 1-5: Work now with core properties (duration_ms, click_x, click_y,
--              drag_distance, target_tag, target_id).
-- Queries 6-8: Gated on approach dynamics properties with IS NOT NULL guards.
--              Will return empty until approach data accumulates.
--
-- Dialect: ClickHouse SQL (HogQL). Uses `properties.field_name` dot notation.


-- ============================================================================
-- QUERY 1: Data Inventory
-- ============================================================================
-- Run this first. Confirms data access and shows what we're working with.
-- Look for: total event count, number of distinct users/sessions, date range,
-- and what percentage of events have approach dynamics properties.

SELECT
    count()                                             AS total_events,
    uniq(person_id)                                     AS distinct_users,
    uniq(properties.$session_id)                        AS distinct_sessions,
    min(timestamp)                                      AS first_event,
    max(timestamp)                                      AS last_event,
    countIf(properties.target_id IS NOT NULL)            AS events_with_target_id,
    countIf(properties.input_type IS NOT NULL)             AS events_with_input_type,
    countIf(properties.input_type = 'touch')               AS touch_events,
    countIf(properties.approach_velocity_mean IS NOT NULL) AS events_with_approach,
    round(countIf(properties.approach_velocity_mean IS NOT NULL) * 100.0 / count(), 1)
                                                        AS approach_coverage_pct
FROM events
WHERE event = 'click_confidence'


-- ============================================================================
-- QUERY 2: Duration Distribution
-- ============================================================================
-- Histogram of hold durations in 10ms bins plus summary statistics.
-- Reference ranges from motor control literature:
--   Ballistic    <80ms   — fast, automatic, high confidence
--   Normal       80-120ms — typical deliberate click
--   Deliberative 120-160ms — some hesitation or checking
--   Extended     160ms+  — uncertainty, complex target, or accessibility need
--
-- Look for: where the mass sits, shape of the tail, any bimodality.

-- 2a: Summary statistics
SELECT
    count()                         AS n,
    round(avg(properties.duration_ms), 1)       AS mean_ms,
    round(quantile(0.50)(properties.duration_ms), 1) AS median_ms,
    round(quantile(0.25)(properties.duration_ms), 1) AS p25_ms,
    round(quantile(0.75)(properties.duration_ms), 1) AS p75_ms,
    round(quantile(0.05)(properties.duration_ms), 1) AS p5_ms,
    round(quantile(0.95)(properties.duration_ms), 1) AS p95_ms,
    round(stddevPop(properties.duration_ms), 1)      AS sd_ms,
    round(min(properties.duration_ms), 1)            AS min_ms,
    round(max(properties.duration_ms), 1)            AS max_ms,
    countIf(properties.duration_ms < 80)              AS ballistic,
    countIf(properties.duration_ms >= 80 AND properties.duration_ms < 120)  AS normal,
    countIf(properties.duration_ms >= 120 AND properties.duration_ms < 160) AS deliberative,
    countIf(properties.duration_ms >= 160)            AS extended
FROM events
WHERE event = 'click_confidence'
    AND properties.duration_ms IS NOT NULL

-- 2b: 10ms-bin histogram
SELECT
    floor(properties.duration_ms / 10) * 10 AS bin_start,
    count()                                  AS n,
    repeat('█', toUInt32(count() * 40 / (SELECT max(c) FROM (SELECT count() AS c FROM events WHERE event = 'click_confidence' AND properties.duration_ms IS NOT NULL GROUP BY floor(properties.duration_ms / 10)))))
                                             AS bar
FROM events
WHERE event = 'click_confidence'
    AND properties.duration_ms IS NOT NULL
GROUP BY bin_start
ORDER BY bin_start


-- ============================================================================
-- QUERY 3: Per-User Baselines
-- ============================================================================
-- Each user's median, IQR, and click count. Between-person variation typically
-- dominates (literature: 30-50ms within-person SD, but means differ by 50-100ms
-- across people). If all users look the same, the signal is probably weak.
--
-- Look for: spread of medians across users, whether any user is an outlier,
-- minimum click count for reliable baselines (want 15+ per user).

SELECT
    person_id,
    count()                                              AS clicks,
    round(quantile(0.50)(properties.duration_ms), 1)     AS median_ms,
    round(quantile(0.25)(properties.duration_ms), 1)     AS p25_ms,
    round(quantile(0.75)(properties.duration_ms), 1)     AS p75_ms,
    round(quantile(0.75)(properties.duration_ms) - quantile(0.25)(properties.duration_ms), 1)
                                                         AS iqr_ms,
    round(stddevPop(properties.duration_ms), 1)          AS sd_ms,
    round(avg(properties.duration_ms), 1)                AS mean_ms,
    multiIf(
        quantile(0.50)(properties.duration_ms) < 80,  'ballistic',
        quantile(0.50)(properties.duration_ms) < 120, 'normal',
        quantile(0.50)(properties.duration_ms) < 160, 'deliberative',
        'extended'
    )                                                    AS typical_range
FROM events
WHERE event = 'click_confidence'
    AND properties.duration_ms IS NOT NULL
GROUP BY person_id
ORDER BY clicks DESC


-- ============================================================================
-- QUERY 4: By Target
-- ============================================================================
-- Duration breakdown by target_tag and target_id. Reveals which UI elements
-- cause hesitation (longer holds) vs confident interaction (shorter holds).
--
-- Look for: buttons vs links vs inputs, specific elements with high median
-- duration (possible usability issues), targets with high variance (inconsistent).

-- 4a: By tag type
SELECT
    properties.target_tag                                AS tag,
    count()                                              AS clicks,
    round(quantile(0.50)(properties.duration_ms), 1)     AS median_ms,
    round(quantile(0.25)(properties.duration_ms), 1)     AS p25_ms,
    round(quantile(0.75)(properties.duration_ms), 1)     AS p75_ms,
    round(stddevPop(properties.duration_ms), 1)          AS sd_ms,
    round(avg(properties.drag_distance), 1)              AS avg_drag_px
FROM events
WHERE event = 'click_confidence'
    AND properties.duration_ms IS NOT NULL
GROUP BY tag
ORDER BY clicks DESC

-- 4b: By specific element (target_id), top 20 by click count
SELECT
    properties.target_id                                 AS target_id,
    properties.target_tag                                AS tag,
    count()                                              AS clicks,
    round(quantile(0.50)(properties.duration_ms), 1)     AS median_ms,
    round(quantile(0.25)(properties.duration_ms), 1)     AS p25_ms,
    round(quantile(0.75)(properties.duration_ms), 1)     AS p75_ms,
    round(stddevPop(properties.duration_ms), 1)          AS sd_ms
FROM events
WHERE event = 'click_confidence'
    AND properties.duration_ms IS NOT NULL
    AND properties.target_id IS NOT NULL
GROUP BY target_id, tag
ORDER BY clicks DESC
LIMIT 20


-- ============================================================================
-- QUERY 5: Session Drift
-- ============================================================================
-- Compare first-half vs second-half durations within sessions that have 10+
-- clicks. Tests for fatigue (durations increase) or familiarization (decrease).
--
-- Look for: consistent direction of drift across sessions. If second-half
-- medians are lower, users are getting faster (familiarization). If higher,
-- fatigue or task complexity is increasing.

SELECT
    session_id,
    click_count,
    round(first_half_median, 1)   AS first_half_median_ms,
    round(second_half_median, 1)  AS second_half_median_ms,
    round(second_half_median - first_half_median, 1) AS drift_ms,
    multiIf(
        second_half_median - first_half_median < -10, 'familiarization',
        second_half_median - first_half_median > 10,  'fatigue',
        'stable'
    ) AS drift_label
FROM (
    SELECT
        properties.$session_id AS session_id,
        count() AS click_count,
        quantileIf(0.50)(properties.duration_ms, rn <= half_n)  AS first_half_median,
        quantileIf(0.50)(properties.duration_ms, rn > half_n)   AS second_half_median
    FROM (
        SELECT
            properties.$session_id,
            properties.duration_ms,
            row_number() OVER (PARTITION BY properties.$session_id ORDER BY timestamp) AS rn,
            floor(count() OVER (PARTITION BY properties.$session_id) / 2)              AS half_n,
            count() OVER (PARTITION BY properties.$session_id)                         AS total_n
        FROM events
        WHERE event = 'click_confidence'
            AND properties.duration_ms IS NOT NULL
            AND properties.$session_id IS NOT NULL
    )
    WHERE total_n >= 10
    GROUP BY session_id
)
ORDER BY click_count DESC


-- ============================================================================
-- QUERY 6: Approach Dynamics Distributions (when available)
-- ============================================================================
-- Summary stats for the 6 approach metrics. Establishes what "normal" approach
-- behavior looks like before correlating with hold duration.
--
-- Properties: approach_velocity_mean, approach_velocity_final, approach_pause_ms,
--             approach_corrections, approach_distance, approach_deceleration
--
-- GATED: Returns empty rows until approach data accumulates.
-- Look for: distributions of each metric, which have useful variance.

SELECT
    count()                                                     AS n,
    -- approach_velocity_mean (px/ms, mean over last 500ms)
    round(avg(properties.approach_velocity_mean), 3)            AS vel_mean_avg,
    round(quantile(0.50)(properties.approach_velocity_mean), 3) AS vel_mean_median,
    round(stddevPop(properties.approach_velocity_mean), 3)      AS vel_mean_sd,
    -- approach_velocity_final (px/ms, last sample before mousedown)
    round(avg(properties.approach_velocity_final), 3)           AS vel_final_avg,
    round(quantile(0.50)(properties.approach_velocity_final), 3) AS vel_final_median,
    round(stddevPop(properties.approach_velocity_final), 3)     AS vel_final_sd,
    -- approach_pause_ms (time since last significant movement before click)
    round(avg(properties.approach_pause_ms), 1)                 AS pause_mean,
    round(quantile(0.50)(properties.approach_pause_ms), 1)      AS pause_median,
    round(stddevPop(properties.approach_pause_ms), 1)           AS pause_sd,
    -- approach_corrections (velocity direction reversals)
    round(avg(properties.approach_corrections), 2)              AS corrections_mean,
    round(quantile(0.50)(properties.approach_corrections), 2)   AS corrections_median,
    -- approach_distance (px)
    round(avg(properties.approach_distance), 1)                 AS distance_mean,
    round(quantile(0.50)(properties.approach_distance), 1)      AS distance_median,
    round(stddevPop(properties.approach_distance), 1)           AS distance_sd,
    -- approach_deceleration (px/ms², negative = slowing)
    round(avg(properties.approach_deceleration), 4)             AS decel_mean,
    round(quantile(0.50)(properties.approach_deceleration), 4)  AS decel_median,
    round(stddevPop(properties.approach_deceleration), 4)       AS decel_sd
FROM events
WHERE event = 'click_confidence'
    AND properties.approach_velocity_mean IS NOT NULL


-- ============================================================================
-- QUERY 7: Hold Duration × Approach Correlation (when available)
-- ============================================================================
-- Bucket hold durations into reference ranges, then compare approach metrics
-- across buckets. This is the core question: do approach dynamics predict
-- hold duration (and thus click confidence)?
--
-- GATED: Requires approach data.
-- Look for: monotonic trends — e.g., do deliberative clicks have lower
-- approach velocity, more corrections, higher pause before click?

SELECT
    multiIf(
        properties.duration_ms < 80,  '1_ballistic',
        properties.duration_ms < 120, '2_normal',
        properties.duration_ms < 160, '3_deliberative',
        '4_extended'
    )                                                           AS hold_bucket,
    count()                                                     AS n,
    -- approach velocity
    round(avg(properties.approach_velocity_mean), 3)            AS avg_vel_mean,
    round(quantile(0.50)(properties.approach_velocity_mean), 3) AS med_vel_mean,
    round(avg(properties.approach_velocity_final), 3)           AS avg_vel_final,
    -- pause before click
    round(avg(properties.approach_pause_ms), 1)                 AS avg_pause_ms,
    -- corrections
    round(avg(properties.approach_corrections), 2)              AS avg_corrections,
    -- distance
    round(avg(properties.approach_distance), 1)                 AS avg_distance,
    -- deceleration
    round(avg(properties.approach_deceleration), 4)             AS avg_decel
FROM events
WHERE event = 'click_confidence'
    AND properties.duration_ms IS NOT NULL
    AND properties.approach_velocity_mean IS NOT NULL
GROUP BY hold_bucket
ORDER BY hold_bucket


-- ============================================================================
-- QUERY 8: Confident vs Uncertain Click Profiles (when available)
-- ============================================================================
-- Per-user z-score classification combining hold duration + approach metrics.
-- A click is "uncertain" if it's slow for that user AND has jittery approach
-- dynamics (high corrections count). Then: which targets accumulate
-- uncertain clicks?
--
-- GATED: Requires approach data + enough per-user clicks for z-scores.
-- Look for: specific target_ids that disproportionately attract uncertain
-- clicks — these are usability improvement candidates.

-- 8a: Classify each click as confident/uncertain using per-user z-scores
SELECT
    properties.target_tag                                       AS tag,
    properties.target_id                                        AS target_id,
    count()                                                     AS total_clicks,
    countIf(is_uncertain = 1)                                   AS uncertain_clicks,
    round(countIf(is_uncertain = 1) * 100.0 / count(), 1)      AS uncertain_pct,
    round(avg(duration_z), 2)                                   AS avg_duration_z,
    round(avg(corrections_z), 2)                                AS avg_corrections_z
FROM (
    SELECT
        *,
        -- A click is "uncertain" if hold duration is above the user's norm
        -- AND approach corrections are above the user's norm (jittery path)
        multiIf(
            duration_z > 0.5 AND corrections_z > 0.5, 1,
            duration_z > 1.0, 1,
            0
        ) AS is_uncertain
    FROM (
        SELECT
            person_id,
            properties.target_tag,
            properties.target_id,
            properties.duration_ms,
            properties.approach_corrections,
            -- z-score: how far this click is from the user's own baseline
            (properties.duration_ms - avg(properties.duration_ms) OVER (PARTITION BY person_id))
                / nullIf(stddevPop(properties.duration_ms) OVER (PARTITION BY person_id), 0)
                AS duration_z,
            (properties.approach_corrections - avg(properties.approach_corrections) OVER (PARTITION BY person_id))
                / nullIf(stddevPop(properties.approach_corrections) OVER (PARTITION BY person_id), 0)
                AS corrections_z
        FROM events
        WHERE event = 'click_confidence'
            AND properties.duration_ms IS NOT NULL
            AND properties.approach_corrections IS NOT NULL
            AND person_id IN (
                -- Only users with enough clicks for meaningful z-scores
                SELECT person_id
                FROM events
                WHERE event = 'click_confidence'
                    AND properties.approach_corrections IS NOT NULL
                GROUP BY person_id
                HAVING count() >= 15
            )
    )
)
WHERE target_id IS NOT NULL
GROUP BY tag, target_id
HAVING total_clicks >= 3
ORDER BY uncertain_pct DESC, total_clicks DESC
LIMIT 30


-- ============================================================================
-- QUERY 9: Touch vs Mouse — Data Inventory
-- ============================================================================
-- How many events came from touch vs mouse? Uses properties.input_type
-- ('mouse' or 'touch') set by clicksense core. For events captured before
-- input_type was added, falls back to PostHog's $device_type as a proxy.
--
-- Run this first to see if there's enough touch data to analyze.

-- 9a: By input_type (preferred, requires recent clicksense version)
SELECT
    properties.input_type                                    AS input_type,
    count()                                                  AS events,
    uniq(person_id)                                          AS users,
    uniq(properties.$session_id)                             AS sessions,
    min(timestamp)                                           AS first_event,
    max(timestamp)                                           AS last_event,
    countIf(properties.approach_velocity_mean IS NOT NULL)    AS with_approach,
    round(avg(properties.duration_ms), 1)                    AS avg_duration_ms,
    round(quantile(0.50)(properties.duration_ms), 1)         AS median_duration_ms
FROM events
WHERE event = 'click_confidence'
GROUP BY input_type
ORDER BY events DESC

-- 9b: By device_type (fallback for older events without input_type)
SELECT
    properties.$device_type                                  AS device_type,
    count()                                                  AS events,
    countIf(properties.input_type IS NOT NULL)                AS has_input_type,
    round(avg(properties.duration_ms), 1)                    AS avg_duration_ms
FROM events
WHERE event = 'click_confidence'
GROUP BY device_type
ORDER BY events DESC


-- ============================================================================
-- QUERY 10: Touch Duration Distribution
-- ============================================================================
-- Same as Query 2 but filtered to likely-touch events (Mobile/Tablet device).
-- Touch hold durations may differ from mouse: finger-on-glass timing has
-- different motor dynamics than mouse button press.
--
-- Compare these stats against Query 2 to see if the distributions diverge.

-- 10a: Summary statistics (touch only)
SELECT
    count()                                              AS n,
    round(avg(properties.duration_ms), 1)                AS mean_ms,
    round(quantile(0.50)(properties.duration_ms), 1)     AS median_ms,
    round(quantile(0.25)(properties.duration_ms), 1)     AS p25_ms,
    round(quantile(0.75)(properties.duration_ms), 1)     AS p75_ms,
    round(quantile(0.05)(properties.duration_ms), 1)     AS p5_ms,
    round(quantile(0.95)(properties.duration_ms), 1)     AS p95_ms,
    round(stddevPop(properties.duration_ms), 1)          AS sd_ms,
    round(min(properties.duration_ms), 1)                AS min_ms,
    round(max(properties.duration_ms), 1)                AS max_ms,
    countIf(properties.duration_ms < 80)                 AS ballistic,
    countIf(properties.duration_ms >= 80 AND properties.duration_ms < 120)  AS normal,
    countIf(properties.duration_ms >= 120 AND properties.duration_ms < 160) AS deliberative,
    countIf(properties.duration_ms >= 160)               AS extended
FROM events
WHERE event = 'click_confidence'
    AND properties.duration_ms IS NOT NULL
    AND (properties.input_type = 'touch'
         OR (properties.input_type IS NULL AND properties.$device_type IN ('Mobile', 'Tablet')))

-- 10b: 10ms-bin histogram (touch only)
SELECT
    floor(properties.duration_ms / 10) * 10 AS bin_start,
    count()                                  AS n
FROM events
WHERE event = 'click_confidence'
    AND properties.duration_ms IS NOT NULL
    AND (properties.input_type = 'touch'
         OR (properties.input_type IS NULL AND properties.$device_type IN ('Mobile', 'Tablet')))
GROUP BY bin_start
ORDER BY bin_start


-- ============================================================================
-- QUERY 11: Touch vs Mouse Duration Comparison
-- ============================================================================
-- Side-by-side stats. Expect touch to be slightly longer than mouse —
-- finger-on-glass has higher contact latency and less precise release timing.

SELECT
    coalesce(
        properties.input_type,
        multiIf(properties.$device_type IN ('Mobile', 'Tablet'), 'touch', 'mouse')
    )                                                        AS input_type,
    count()                                                  AS n,
    round(avg(properties.duration_ms), 1)                    AS mean_ms,
    round(quantile(0.50)(properties.duration_ms), 1)         AS median_ms,
    round(quantile(0.25)(properties.duration_ms), 1)         AS p25_ms,
    round(quantile(0.75)(properties.duration_ms), 1)         AS p75_ms,
    round(stddevPop(properties.duration_ms), 1)              AS sd_ms,
    round(avg(properties.drag_distance), 1)                  AS avg_drag_px,
    -- bucket distribution as percentages
    round(countIf(properties.duration_ms < 80) * 100.0 / count(), 1)
                                                             AS pct_ballistic,
    round(countIf(properties.duration_ms >= 80 AND properties.duration_ms < 120) * 100.0 / count(), 1)
                                                             AS pct_normal,
    round(countIf(properties.duration_ms >= 120 AND properties.duration_ms < 160) * 100.0 / count(), 1)
                                                             AS pct_deliberative,
    round(countIf(properties.duration_ms >= 160) * 100.0 / count(), 1)
                                                             AS pct_extended
FROM events
WHERE event = 'click_confidence'
    AND properties.duration_ms IS NOT NULL
GROUP BY input_type
ORDER BY input_type


-- ============================================================================
-- QUERY 12: Touch Targets — What Are People Tapping?
-- ============================================================================
-- Target breakdown for touch events. Mobile UI elements may have different
-- tap confidence profiles than desktop (bigger targets, less precision).

-- 12a: By tag
SELECT
    properties.target_tag                                AS tag,
    count()                                              AS taps,
    round(quantile(0.50)(properties.duration_ms), 1)     AS median_ms,
    round(quantile(0.25)(properties.duration_ms), 1)     AS p25_ms,
    round(quantile(0.75)(properties.duration_ms), 1)     AS p75_ms,
    round(stddevPop(properties.duration_ms), 1)          AS sd_ms,
    round(avg(properties.drag_distance), 1)              AS avg_drag_px
FROM events
WHERE event = 'click_confidence'
    AND properties.duration_ms IS NOT NULL
    AND (properties.input_type = 'touch'
         OR (properties.input_type IS NULL AND properties.$device_type IN ('Mobile', 'Tablet')))
GROUP BY tag
ORDER BY taps DESC

-- 12b: By specific element, top 20
SELECT
    coalesce(properties.target_label, properties.target_id, properties.target_text) AS target,
    properties.target_tag                                AS tag,
    count()                                              AS taps,
    round(quantile(0.50)(properties.duration_ms), 1)     AS median_ms,
    round(quantile(0.75)(properties.duration_ms) - quantile(0.25)(properties.duration_ms), 1)
                                                         AS iqr_ms,
    round(avg(properties.drag_distance), 1)              AS avg_drag_px
FROM events
WHERE event = 'click_confidence'
    AND properties.duration_ms IS NOT NULL
    AND (properties.input_type = 'touch'
         OR (properties.input_type IS NULL AND properties.$device_type IN ('Mobile', 'Tablet')))
GROUP BY target, tag
HAVING taps >= 2
ORDER BY taps DESC
LIMIT 20


-- ============================================================================
-- QUERY 13: Touch Drag Distance Distribution
-- ============================================================================
-- On touch, drag_distance is the finger displacement from touchstart to
-- touchend. Higher variance than mouse because finger contact area is large
-- and minor slips are common. Events >10px are already filtered out by
-- clicksense, but the sub-10px distribution is informative.

SELECT
    floor(properties.drag_distance) AS drag_px,
    count()                         AS n
FROM events
WHERE event = 'click_confidence'
    AND properties.drag_distance IS NOT NULL
    AND (properties.input_type = 'touch'
         OR (properties.input_type IS NULL AND properties.$device_type IN ('Mobile', 'Tablet')))
GROUP BY drag_px
ORDER BY drag_px


-- ============================================================================
-- QUERY 14: Touch Session Drift
-- ============================================================================
-- Same as Query 5 but for touch sessions. Does tap duration change over
-- a mobile session? Mobile fatigue patterns may differ from desktop.

SELECT
    session_id,
    click_count,
    round(first_half_median, 1)   AS first_half_median_ms,
    round(second_half_median, 1)  AS second_half_median_ms,
    round(second_half_median - first_half_median, 1) AS drift_ms,
    multiIf(
        second_half_median - first_half_median < -10, 'familiarization',
        second_half_median - first_half_median > 10,  'fatigue',
        'stable'
    ) AS drift_label
FROM (
    SELECT
        properties.$session_id AS session_id,
        count() AS click_count,
        quantileIf(0.50)(properties.duration_ms, rn <= half_n)  AS first_half_median,
        quantileIf(0.50)(properties.duration_ms, rn > half_n)   AS second_half_median
    FROM (
        SELECT
            properties.$session_id,
            properties.duration_ms,
            row_number() OVER (PARTITION BY properties.$session_id ORDER BY timestamp) AS rn,
            floor(count() OVER (PARTITION BY properties.$session_id) / 2)              AS half_n,
            count() OVER (PARTITION BY properties.$session_id)                         AS total_n
        FROM events
        WHERE event = 'click_confidence'
            AND properties.duration_ms IS NOT NULL
            AND properties.$session_id IS NOT NULL
            AND (properties.input_type = 'touch'
         OR (properties.input_type IS NULL AND properties.$device_type IN ('Mobile', 'Tablet')))
    )
    WHERE total_n >= 6
    GROUP BY session_id
)
ORDER BY click_count DESC
