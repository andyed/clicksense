# PostHog Export — 2026-03-28

First data pull from `click_confidence` events. 5,201 total events (3,725 desktop / 1,476 mobile / 3 tablet) across 550 users and 665 sessions, from 2026-03-01 to 2026-03-28. All events from scrutinizer-www.

`input_type` property was not yet deployed — touch vs mouse inferred from PostHog's `$device_type`.

## Files

| File | Query | Description |
|------|-------|-------------|
| `q3_per_user_baselines.csv` | Q3 | Per-user median, IQR, SD, typical range. 550 users. |
| `q4a_by_tag.csv` | Q4a | Duration breakdown by HTML tag. Canvas dominates (2,792). |
| `q4b_by_target_id.csv` | Q4b | Top 20 target elements. `#screen` = 2,782 clicks. |
| `q6_approach_distributions.csv` | Q6 | Approach dynamics summary stats (mouse only, n=2,795). |
| `q7_hold_x_approach.csv` | Q7 | Hold duration buckets × approach dynamics. Deceleration is monotonic. |
| `q9a_by_input_type.csv` | Q9a | By `input_type` — all NULL (property not yet deployed). |
| `q9b_by_device_type.csv` | Q9b | By `$device_type` — 3,725 Desktop / 1,476 Mobile / 3 Tablet. |
| `q10a_touch_duration_stats.csv` | Q10a | Touch-only duration summary. Median 99ms, mean 167ms, SD 284ms. |
| `q11_touch_vs_mouse.csv` | Q11 | Side-by-side touch vs mouse. Touch median 20ms faster but 2.5× SD. |

## Key findings

- **Touch is faster at the median** (99ms vs 119ms mouse) but has a fat right tail (SD 284 vs 115).
- **26% of touch events are ballistic** (<80ms) vs 8.5% for mouse — finger-on-glass has lower activation threshold.
- **Mean/median divergence** for touch (167/99 = 68ms gap) vs mouse (133/119 = 14ms gap) indicates heavy skew.
- **Deceleration is monotonic** across hold buckets: -0.0012 (ballistic) → -0.0076 (extended).
- **Corrections peak in "normal" bucket** (12.3), not deliberative (9.59) — direction reversals reflect active targeting, not hesitation.

## Missing queries

Queries 1, 2, 5, 8, 10b, 12–14 were not exported (some errored on `input_type` which didn't exist yet). Re-run after deploying the `input_type` property.

## SQL

Queries are in `../analysis.sql`. Queries 9–14 now use `properties.input_type` with `$device_type` fallback.
