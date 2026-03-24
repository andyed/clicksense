# ClickSense

Click confidence measurement from motor behavior. 2KB, zero dependencies, vendor-agnostic.

## The idea

A mouse click is two events: mousedown (commitment) and mouseup (release). The latency between them — typically 50-140ms — reflects the motor system's confidence at the moment of action. ClickSense captures this hold duration alongside the mouse's approach trajectory leading up to the click.

Hold duration alone is a small signal (~7ms task effect across studies). The strong cognitive signal lives in pre-click dwell time (91ms correct/incorrect discrimination) — but dwell time is hard to instrument: you need heuristics for "arrived at target," handling hover-without-intent, variable target sizes. Click duration is trivial (two event listeners). Approach dynamics — cursor velocity, deceleration, course corrections in the moments before mousedown — bridge the gap: they approximate the pre-click evaluation phase with the same ease of instrumentation as click duration itself. The hope is the two combine into something useful.

What makes hold duration interesting is what it's *independent from*. Self-reported cognitive load (NASA-TLX) doesn't correlate with it. Neither does task correctness. It's not a noisy proxy for things we already measure. The strongest effects show up around identity-relevant content and domain expertise: political experts differentiate facts from opinions in their click latency; non-experts don't. Non-voters hold 19ms longer on prospective voting questions than retrospective ones.

**Reference:** Edmonds (2016) ["Learning from Complex Online Behavior"](https://youtu.be/j38fm48gTgg?t=1348), Bloomreach "Big Brains" talk. Data: Edmonds (CrowdFlower, 2015, n=291), Azzopardi & Edmonds (Prolific, 2022, n=227).

## Install

```bash
npm install clicksense
```

Or load via script tag:

```html
<script src="dist/clicksense.js"></script>
```

## Quick start

```js
import { ClickSense } from 'clicksense';

const cs = new ClickSense({
  enableApproachDynamics: true,
  onCapture: (event) => {
    console.log(`${event.duration_ms}ms on ${event.target.tag}`, event);
  },
});
```

Each captured click produces:

```js
{
  duration_ms: 87,              // mousedown→mouseup latency
  timestamp: 1709312400000,
  x: 512, y: 340,
  drag_distance: 1,
  target: {
    tag: 'button',
    id: 'submit-btn',
    label: 'checkout',          // from data-clicksense="checkout"
    text: 'Complete Purchase',
  },
  approach: {                   // present when enableApproachDynamics: true
    approach_velocity_mean: 0.412,
    approach_velocity_final: 0.089,
    approach_deceleration: -0.001234,
    approach_corrections: 3,
    approach_distance: 287,
    approach_pause_ms: 42,
  }
}
```

## Approach dynamics

The pre-click mouse trajectory is where the stronger signal lives. When `enableApproachDynamics` is enabled, ClickSense maintains a ring buffer of velocity samples from `mousemove` events (using `getCoalescedEvents()` for sub-frame resolution on high-polling-rate mice) and harvests summary statistics at the moment of mousedown:

| Field | Description |
|-------|-------------|
| `approach_velocity_mean` | Mean cursor speed over last 500ms (px/ms) |
| `approach_velocity_final` | Speed at the most recent sample before click |
| `approach_deceleration` | Linear regression slope of velocity over last 300ms. Negative = smooth Fitts's law approach; positive = overshooting |
| `approach_corrections` | Velocity direction reversals — jittery approach vs. smooth ballistic arc |
| `approach_distance` | Total cursor distance traveled (px) |
| `approach_pause_ms` | Time since last significant movement. 0 = clicked while moving; 100+ = paused to aim |

A confident click looks like: smooth deceleration, low corrections, short pause, ballistic hold. An uncertain click: course corrections, longer pause, extended hold. The combination captures the full motor signature of a decision.

## Options

```js
new ClickSense({
  enableApproachDynamics: true, // recommended — pre-click velocity profiling
  minDuration: 10,              // ms — below = programmatic click
  maxDuration: 3000,            // ms — above = press-and-hold
  maxDragDistance: 10,           // px — above = drag, not click
  captureText: true,            // include truncated innerText
  textMaxLength: 80,
  buttons: [0],                 // 0=left, 1=middle, 2=right
  scope: null,                  // CSS selector to limit tracking
  onCapture: (event) => {},     // required
});
```

## Adapters

### PostHog

```js
import { ClickSense } from 'clicksense';
import { createPostHogAdapter } from 'clicksense/adapters/posthog';

new ClickSense({
  onCapture: createPostHogAdapter(),            // uses window.posthog
  // or: createPostHogAdapter(posthogInstance)   // explicit instance
});
// Sends 'click_confidence' events with flattened properties
```

### Buffered callback

For sendBeacon, Adobe Analytics, custom endpoints, or localStorage:

```js
import { ClickSense } from 'clicksense';
import { createBufferedAdapter } from 'clicksense/adapters/callback';

new ClickSense({
  onCapture: createBufferedAdapter({
    flushInterval: 10000,   // flush every 10s (default: 30s)
    maxBuffer: 200,         // flush at 200 events
    onFlush: (events) => {
      navigator.sendBeacon('/analytics', JSON.stringify(events));
    },
  }),
});
```

Flushes automatically on `visibilitychange` (page hide/tab switch).

## Target extraction

ClickSense walks the DOM from the click target to find the nearest meaningful element (`a`, `button`, `[role="button"]`, `input`, `select`, `label`, or `[data-clicksense]`). Use the `data-clicksense` attribute for explicit labeling:

```html
<div data-clicksense="hero-cta" class="promo-card">
  <h2>Spring Sale</h2>
  <button>Shop Now</button>
</div>
```

## Design decisions

- **Capture phase listeners** — events are seen before `stopPropagation`
- **`performance.now()`** — sub-millisecond precision, not `Date.now()`
- **Drag filter** — displacement > 10px between down/up = drag, discarded
- **Touch support** — `touchstart`/`touchend` for mobile
- **No runtime dependencies** — core is pure JS, adapters are optional

## Cleanup

```js
cs.destroy(); // removes all listeners
```

## Build

```bash
npm run build   # → dist/clicksense.js (IIFE), .esm.js, .cjs.js
npm run dev     # watch mode
```

## Research

See [`docs/clicksense-paper.md`](docs/clicksense-paper.md) for the full empirical framing: study designs, effect sizes, confound analysis, and where click duration does and doesn't work.

## License

MIT
