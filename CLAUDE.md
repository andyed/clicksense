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

- **PostHog SQL queries**: `queries/analysis.sql` — 8 HogQL queries (data inventory, duration distributions, per-user baselines, target breakdown, session drift, approach dynamics).
- **Dashboard**: [Hold Duration × Approach Dynamics](https://us.posthog.com/project/258589/dashboard/1330450) — 117 events with approach data across 4 hold buckets.
- **Key finding (Mar 2026)**: Deceleration is monotonic across hold buckets (-0.0011 → -0.0052). Deliberative clicks (120-160ms) show a 316ms pre-click pause — 2.4x other buckets — suggesting decision cost, not motor cost. Corrections peak in the "normal" bucket (12.0), not deliberative.
- **Property names**: `duration_ms`, `click_x`, `click_y`, `drag_distance`, `input_type`, `target_tag`, `target_id`, `approach_velocity_mean`, `approach_velocity_final`, `approach_deceleration`, `approach_corrections`, `approach_distance`, `approach_pause_ms`, `approach_linearity`, `approach_max_deviation`, `approach_trajectory_type`.

## Cross-Project Research

This project is part of a connected research program:
- **Research log**: `~/Documents/dev/research-log.jsonl` — auto-captured WebFetch/WebSearch URLs across all Claude Code sessions. Query ClickSense-relevant entries: `jq 'select(.project=="clicksense")' ~/Documents/dev/research-log.jsonl`
- **interests2025 pipeline**: Research URLs are ingested into Qdrant (`node src/ingest_research_log.js --index`) for semantic search across all projects.
- **Related projects**: Scrutinizer (visual perception), Psychodeli+ (rendering), histospire (browsing behavior)
- **Session history**: Each research log entry includes `transcript_path` for tracing back to the Claude Code conversation where the research occurred.
