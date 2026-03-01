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
