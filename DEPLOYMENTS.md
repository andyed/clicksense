# ClickSense Deployments

Track all projects with ClickSense installed. Update this file when adding, removing, or upgrading installations.

**Source of truth:** `/Users/andyed/Documents/dev/clicksense/dist/`
**Current version:** 0.1.0 (trajectory-aware, 2026-03-24)
**Build command:** `node build.js` in clicksense repo

## Active Installations

| Project | Path | File Location | Integration | PostHog | Status |
|---------|------|---------------|-------------|---------|--------|
| scrutinizer-www | `scrutinizer-repo/scrutinizer-www/` | `src/js/clicksense.js` | `<script>` tag, IIFE | Yes (project 258589) | **DEPLOYED** (gh-pages, 2026-03-25) |
| inside_the_math | `psychodeli-webgl-port/inside_the_math/` | `../js/lib/clicksense.js` (shared) | `<script>` tag, IIFE | Yes (project 258589) | **INSTALLED** (deploys with psychodeli) |
| psychodeli-webgl-port | `psychodeli-webgl-port/` | `js/lib/clicksense.js` | `<script>` tag, IIFE | Yes (project 258589) | **INSTALLED** (updated 2026-03-25) |
| mindbendingpixels-www | `mindbendingpixels-www/` | `js/clicksense.js` | `<script>` tag, IIFE | Yes (project 258589) | **INSTALLED** (needs deploy) |

## Planned Installations

| Project | Path | Integration Type | Notes |
|---------|------|-----------------|-------|
| iblipper2025 | `iblipper2025/` | ESM import (Capacitor) | RSVP app — click confidence on text navigation |
| iblipper.com | `iblipper.com/` | `<script>` tag, IIFE | Marketing site |

## Update Procedure

When updating ClickSense:

1. Make changes in `clicksense/src/clicksense.js`
2. Run `node build.js` in clicksense repo
3. Copy `dist/clicksense.js` to each active installation's JS directory
4. Rebuild/redeploy each project
5. Update this file with date

## PostHog Properties

All properties sent via the PostHog adapter:

### Core
- `duration_ms` — mousedown-to-mouseup hold duration
- `click_x`, `click_y` — click coordinates
- `drag_distance` — distance between mousedown and mouseup positions
- `target_tag`, `target_id`, `target_label`, `target_classes`, `target_href`, `target_text`

### Approach Dynamics (when `enableApproachDynamics: true`)
- `approach_velocity_mean` — mean cursor velocity in last 500ms (px/ms)
- `approach_velocity_final` — velocity at moment of mousedown
- `approach_deceleration` — velocity slope in last 300ms (negative = decelerating)
- `approach_corrections` — velocity direction reversals in last 500ms
- `approach_distance` — total distance traveled in last 500ms (px)
- `approach_pause_ms` — time since last significant movement (ms)

### Trajectory Shape (new in 0.1.0)
- `approach_linearity` — straight-line / total path distance (0-1, 1 = perfectly straight)
- `approach_max_deviation` — max perpendicular distance from ideal line (px, = mousetrap's MAD)
- `approach_trajectory_type` — `straight`, `curved`, or `reversal`

## Integration Snippet

### Script Tag (IIFE)
```html
<script src="js/clicksense.js"></script>
<script>
  new ClickSenseLib.ClickSense({
    enableApproachDynamics: true,
    onCapture: ClickSenseLib.createPostHogAdapter()
  });
</script>
```

### ESM Import
```javascript
import { ClickSense, createPostHogAdapter } from 'clicksense';

new ClickSense({
  enableApproachDynamics: true,
  onCapture: createPostHogAdapter()
});
```
