# ClickSense

Mousedown→mouseup latency as cognitive load / click confidence signal.

## Origin

Andy Edmonds (2016) Bloomreach "Big Brains" talk — demonstrated that click hold duration
correlates with emotional/identity engagement, not task difficulty. Political questions
about Obama/Trump produced 110-125ms holds; obscure factual recall produced 75ms.
The core range across n=200 crowdsourced participants was 50-120ms.

Reference: https://youtu.be/j38fm48gTgg?t=1348

## Architecture

- **Core** (`src/clicksense.js`): Vendor-agnostic mousedown/mouseup/touch timing.
  Filters drags, programmatic clicks, and press-and-holds. Walks DOM to find
  nearest meaningful target (link, button, role="button"). Supports `data-clicksense`
  attribute for explicit labeling.

- **Adapters**: Thin wrappers for analytics backends.
  - `adapters/posthog.js` — flattens to PostHog properties
  - `adapters/callback.js` — buffers + flushes (for sendBeacon, Adobe Analytics, etc.)

- **Build**: esbuild → IIFE (script tag), ESM (import), CJS (test/SSR)

## Integration

Currently deployed on:
- scrutinizer-www (PostHog, script tag)

Planned:
- psychodeli-webgl-port
- iblipper2025

## Key design decisions

- Capture phase listeners (see events before stopPropagation)
- `performance.now()` for sub-ms timing (not Date.now())
- Drag distance filter (>10px = drag, not click)
- Touch support (touchstart/touchend) for mobile
- `data-clicksense="label"` attribute for explicit target naming
- No PostHog dependency in core — adapter pattern only

## Analysis

- **PostHog SQL queries**: `queries/analysis.sql` — 16 HogQL queries (data inventory, duration distributions, per-user baselines, target breakdown, session drift, approach dynamics, touch vs mouse, hyperlink/any-target deltas from baseline).
- **Dashboards**:
  - Scrutinizer project (258589): [Hold Duration × Approach Dynamics](https://us.posthog.com/project/258589/dashboard/1330450) (117 events, Mar 2026 baseline).
  - Psychodeli project: primary production dataset (n=2,917 as of 2026-04-17 — 25× the Scrutinizer sample).
- **Key findings (Psychodeli, 2026-04-17, n=2,917)**:
  - Deceleration monotonic across hold buckets (-0.0012 → -0.0074). Holds and steepens vs Mar.
  - Velocity monotonic with hold bucket (0.62 → 1.02 mean, 0.35 → 0.52 median). *New.*
  - Distance monotonic with hold bucket (200 → 239 px). *New.*
  - Corrections peak in "normal" bucket (12.23). Holds.
  - Pre-click pause is flat at 123-128 ms for ballistic/normal/deliberative; only "extended" (>160 ms) jumps to 189 ms. **The Mar "316 ms deliberative pause, 2.4× other buckets" finding does NOT replicate at n=2,917.**
- **Property names** (v0.1 core): `duration_ms`, `click_x`, `click_y`, `drag_distance`, `input_type`, `target_tag`, `target_id`, `target_label`, `target_classes`, `target_href`, `target_text`, `approach_velocity_mean`, `approach_velocity_final`, `approach_deceleration`, `approach_corrections`, `approach_distance`, `approach_pause_ms`, `approach_linearity`, `approach_max_deviation`, `approach_trajectory_type`.
- **Property names** (v0.2 autoLabel, 2026-04-17): `target_aria_label`, `target_title`, `target_name_attr`, `target_value`, `target_placeholder`, `target_name` (computed accessible name), `target_path` (short CSS selector, depth configurable), plus `target_data_<key>` for every `data-*` attribute on the element (e.g. `target_data_preset`, `target_data_mode`). Default `pathDepth: 3`.

## Research Data

- **Structured findings**: `docs/data/research-findings.json` — 26 extracted numeric findings from cited papers and production data. Each entry has source citation, values, unit, and optional chart spec. Consumable by `ascii-charts/chart.py --json`.
- **CSV exports**: `queries/exports/2026-03-28/` — 5,201 events from 550 users (first data pull, Mar 2026).
- **Deep-dive docs**: `docs/deep-dive-*.md` — 6 research summaries (Fitts's law, dwell time, cognitive load, implicit signals, related paradigms). The research-findings.json extracts the chartable numbers from these.

## Cross-Project Research

This project is part of a connected research program:
- **Research log**: `~/Documents/dev/research-log.jsonl` — auto-captured WebFetch/WebSearch URLs across all Claude Code sessions. Query ClickSense-relevant entries: `jq 'select(.project=="clicksense")' ~/Documents/dev/research-log.jsonl`
- **interests2025 pipeline**: Research URLs are ingested into Qdrant (`node src/ingest_research_log.js --index`) for semantic search across all projects.
- **Related projects**: Scrutinizer (visual perception), Psychodeli+ (rendering), histospire (browsing behavior)
- **Session history**: Each research log entry includes `transcript_path` for tracing back to the Claude Code conversation where the research occurred.
