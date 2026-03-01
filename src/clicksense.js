/**
 * ClickSense — mousedown→mouseup latency as cognitive load signal.
 *
 * Core insight: confident clicks are ballistic (fast release, ~50-80ms).
 * Uncertain or emotionally loaded clicks involve a hold phase (~100-140ms+).
 * The delta between mousedown and mouseup *is* the confidence signal.
 *
 * Vendor-agnostic: wire to PostHog, Adobe Analytics, or a plain callback.
 *
 * Reference: Edmonds (2016) "Learning from Complex Online Behavior"
 * https://youtu.be/j38fm48gTgg?t=1348
 */

const DEFAULTS = {
  // Timing thresholds
  minDuration: 10,     // ms — below this is likely programmatic
  maxDuration: 3000,   // ms — above this is a press-and-hold, not a click

  // Drag filter: if mouse moves more than this between down/up, it's a drag
  maxDragDistance: 10,  // px

  // What to capture
  captureText: true,    // include truncated innerText of target
  textMaxLength: 80,    // truncate target text to this length

  // Which buttons to track (0 = left, 1 = middle, 2 = right)
  buttons: [0],

  // Scope: CSS selector to limit tracking (null = entire document)
  scope: null,

  // Approach dynamics: capture mouse velocity profile before click.
  // When true, attaches a passive mousemove listener and maintains a ring buffer
  // of velocity samples. On mousedown, harvests summary statistics describing
  // the approach trajectory — richer than hold duration alone for uncertainty.
  enableApproachDynamics: false,

  // Callback — the only required option
  // Called with: { duration_ms, target, x, y, drag_distance, timestamp, approach? }
  onCapture: null,
};

// --- Approach dynamics constants ---

// Ring buffer capacity: ~1 second of history at 60fps.
// Note on mouse polling: most mice poll at 125 Hz (8ms) or 1000 Hz (1ms for gaming mice).
// Browser mousemove events are further quantized to the display refresh rate (~16ms at 60fps,
// ~8ms at 120fps). getCoalescedEvents() recovers sub-frame samples when available,
// which is critical for accurate velocity estimation on high-polling-rate mice.
const RING_BUFFER_SIZE = 60;

// Each sample occupies 2 Float64 slots: [velocity (px/ms), timestamp (ms)]
const SAMPLE_STRIDE = 2;

// Time windows for summary statistics (ms)
const APPROACH_WINDOW_MS = 500;     // mean velocity, corrections, distance
const DECEL_WINDOW_MS = 300;        // deceleration slope
const MIN_MOVEMENT_PX = 1;          // threshold for "movement" vs pause

export class ClickSense {
  constructor(options = {}) {
    this._config = { ...DEFAULTS, ...options };

    if (!this._config.onCapture) {
      throw new Error('ClickSense: onCapture callback is required');
    }

    // State for current mousedown
    this._pending = null;
    this._root = null;

    // Bound handlers (for clean teardown)
    this._onMouseDown = this._handleMouseDown.bind(this);
    this._onMouseUp = this._handleMouseUp.bind(this);
    this._onTouchStart = this._handleTouchStart.bind(this);
    this._onTouchEnd = this._handleTouchEnd.bind(this);

    // Approach dynamics: velocity ring buffer (opt-in to avoid overhead)
    if (this._config.enableApproachDynamics) {
      this._onMouseMove = this._handleMouseMove.bind(this);

      // Float64Array ring buffer: pairs of [velocity_px_per_ms, timestamp_ms]
      // Using TypedArray for cache-friendly iteration during harvest
      this._velocityBuf = new Float64Array(RING_BUFFER_SIZE * SAMPLE_STRIDE);
      this._bufHead = 0;       // next write index (0..RING_BUFFER_SIZE-1)
      this._bufCount = 0;      // number of valid samples (0..RING_BUFFER_SIZE)

      // Track previous mouse position for delta computation
      this._lastMoveX = NaN;
      this._lastMoveY = NaN;
      this._lastMoveTime = NaN;

      // Track last significant movement for pause detection
      this._lastSignificantMoveTime = NaN;
    }

    this._attach();
  }

  // --- Public API ---

  /** Stop listening. Call when done or on page teardown. */
  destroy() {
    if (this._root) {
      this._root.removeEventListener('mousedown', this._onMouseDown, true);
      this._root.removeEventListener('mouseup', this._onMouseUp, true);
      this._root.removeEventListener('touchstart', this._onTouchStart, true);
      this._root.removeEventListener('touchend', this._onTouchEnd, true);
      if (this._onMouseMove) {
        this._root.removeEventListener('mousemove', this._onMouseMove);
      }
      this._root = null;
    }
    this._pending = null;
    this._velocityBuf = null;
  }

  // --- Internals ---

  _attach() {
    const scope = this._config.scope;
    this._root = scope ? document.querySelector(scope) : document;

    if (!this._root) {
      console.warn(`ClickSense: scope "${scope}" not found, falling back to document`);
      this._root = document;
    }

    // Capture phase so we see events before stopPropagation
    this._root.addEventListener('mousedown', this._onMouseDown, true);
    this._root.addEventListener('mouseup', this._onMouseUp, true);
    this._root.addEventListener('touchstart', this._onTouchStart, { capture: true, passive: true });
    this._root.addEventListener('touchend', this._onTouchEnd, { capture: true, passive: true });

    // Mousemove for approach velocity — passive to never block scrolling/rendering
    if (this._onMouseMove) {
      this._root.addEventListener('mousemove', this._onMouseMove, { passive: true });
    }
  }

  // --- Approach dynamics: velocity ring buffer ---

  /**
   * Record mouse velocity from mousemove events into the ring buffer.
   * Uses getCoalescedEvents() when available for sub-frame resolution —
   * critical because standard mousemove fires at most once per rAF (~16ms),
   * but the mouse hardware may report at 125-1000 Hz.
   */
  _handleMouseMove(e) {
    // getCoalescedEvents() gives us all intermediate pointer positions
    // between the last and current frame. This recovers the sub-frame
    // samples lost to browser event coalescing.
    const events = (typeof e.getCoalescedEvents === 'function')
      ? e.getCoalescedEvents()
      : null;

    // If coalesced events are available and non-empty, process each one;
    // otherwise fall back to the single mousemove event
    if (events && events.length > 0) {
      for (let i = 0; i < events.length; i++) {
        this._recordVelocitySample(events[i].clientX, events[i].clientY, events[i].timeStamp);
      }
    } else {
      this._recordVelocitySample(e.clientX, e.clientY, e.timeStamp);
    }
  }

  /**
   * Push a single velocity sample into the ring buffer.
   * Velocity = Euclidean displacement / dt, in px/ms.
   */
  _recordVelocitySample(x, y, timestamp) {
    // Need a previous sample to compute delta
    if (!isFinite(this._lastMoveTime)) {
      this._lastMoveX = x;
      this._lastMoveY = y;
      this._lastMoveTime = timestamp;
      this._lastSignificantMoveTime = timestamp;
      return;
    }

    const dt = timestamp - this._lastMoveTime;
    // Guard against zero/negative dt (duplicate events, clock issues)
    if (dt <= 0) return;

    const dx = x - this._lastMoveX;
    const dy = y - this._lastMoveY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const velocity = dist / dt;  // px/ms

    // Track last significant movement for pause detection
    if (dist > MIN_MOVEMENT_PX) {
      this._lastSignificantMoveTime = timestamp;
    }

    // Write into ring buffer at head position
    const offset = this._bufHead * SAMPLE_STRIDE;
    this._velocityBuf[offset] = velocity;
    this._velocityBuf[offset + 1] = timestamp;

    // Advance head, wrap around
    this._bufHead = (this._bufHead + 1) % RING_BUFFER_SIZE;
    if (this._bufCount < RING_BUFFER_SIZE) this._bufCount++;

    // Update previous position
    this._lastMoveX = x;
    this._lastMoveY = y;
    this._lastMoveTime = timestamp;
  }

  /**
   * Harvest approach dynamics from the velocity ring buffer at mousedown time.
   * Returns summary statistics or null if insufficient data.
   */
  _harvestApproach(mousedownTime) {
    if (!this._velocityBuf || this._bufCount < 2) return null;

    // Collect samples within the APPROACH_WINDOW_MS before mousedown,
    // reading backward from the most recent sample.
    // The ring buffer head points to the NEXT write slot, so the most
    // recent sample is at (head - 1 + size) % size.
    const cutoff500 = mousedownTime - APPROACH_WINDOW_MS;
    const cutoff300 = mousedownTime - DECEL_WINDOW_MS;

    // Gather relevant samples into temporary arrays for statistics.
    // Using plain arrays here (max 60 elements) — the typed buffer is for
    // the hot path (mousemove); harvest runs once per click.
    const samples500 = [];  // { velocity, timestamp } within 500ms
    const samples300 = [];  // { velocity, timestamp } within 300ms

    for (let i = 0; i < this._bufCount; i++) {
      // Walk backward from most recent
      const idx = ((this._bufHead - 1 - i) + RING_BUFFER_SIZE) % RING_BUFFER_SIZE;
      const offset = idx * SAMPLE_STRIDE;
      const velocity = this._velocityBuf[offset];
      const timestamp = this._velocityBuf[offset + 1];

      // Stop if we've gone past the 500ms window
      if (timestamp < cutoff500) break;

      samples500.push({ velocity, timestamp });
      if (timestamp >= cutoff300) {
        samples300.push({ velocity, timestamp });
      }
    }

    if (samples500.length < 2) return null;

    // --- Summary statistics ---

    // Mean velocity over last 500ms (px/ms)
    let velocitySum = 0;
    for (let i = 0; i < samples500.length; i++) {
      velocitySum += samples500[i].velocity;
    }
    const approach_velocity_mean = velocitySum / samples500.length;

    // Final velocity: the most recent sample before mousedown (px/ms)
    const approach_velocity_final = samples500[0].velocity;

    // Deceleration: linear regression slope of velocity over last 300ms.
    // Negative slope = decelerating (normal Fitts's law approach).
    // Positive slope = accelerating (unusual — maybe overshooting).
    let approach_deceleration = 0;
    if (samples300.length >= 2) {
      // Simple linear regression: velocity = a*time + b
      // Slope a = (n*sum(xy) - sum(x)*sum(y)) / (n*sum(x^2) - sum(x)^2)
      // x = timestamp (relative to window start), y = velocity
      const n = samples300.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      const t0 = samples300[n - 1].timestamp; // oldest sample as origin
      for (let i = 0; i < n; i++) {
        const x = samples300[i].timestamp - t0;
        const y = samples300[i].velocity;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
      }
      const denom = n * sumX2 - sumX * sumX;
      if (isFinite(denom) && Math.abs(denom) > 1e-10) {
        approach_deceleration = (n * sumXY - sumX * sumY) / denom;
      }
    }

    // Corrections: velocity direction reversals in last 500ms.
    // A reversal = velocity was increasing but now decreasing, or vice versa.
    // More reversals = more jittery/uncertain targeting.
    let approach_corrections = 0;
    if (samples500.length >= 3) {
      // samples500 is newest-first; iterate oldest-to-newest for direction
      let prevDelta = 0;
      for (let i = samples500.length - 2; i >= 1; i--) {
        const delta = samples500[i - 1].velocity - samples500[i].velocity;
        // Only count meaningful reversals (both deltas must be non-trivial)
        if (prevDelta !== 0 && delta !== 0 && Math.sign(delta) !== Math.sign(prevDelta)) {
          approach_corrections++;
        }
        if (delta !== 0) prevDelta = delta;
      }
    }

    // Distance: total distance traveled in last 500ms (px).
    // Reconstructed from velocity * dt between consecutive samples.
    let approach_distance = 0;
    for (let i = samples500.length - 1; i >= 1; i--) {
      const dt = samples500[i - 1].timestamp - samples500[i].timestamp;
      if (dt > 0) {
        // Use average of the two sample velocities for the interval
        const avgVel = (samples500[i - 1].velocity + samples500[i].velocity) / 2;
        approach_distance += avgVel * dt;
      }
    }

    // Pause: time since last significant movement (>1px), in ms.
    // 0 = clicking while still moving; 100+ = paused to aim before clicking.
    const approach_pause_ms = isFinite(this._lastSignificantMoveTime)
      ? Math.round(mousedownTime - this._lastSignificantMoveTime)
      : 0;

    return {
      approach_velocity_mean: Math.round(approach_velocity_mean * 1000) / 1000,
      approach_velocity_final: Math.round(approach_velocity_final * 1000) / 1000,
      approach_deceleration: Math.round(approach_deceleration * 1e6) / 1e6,
      approach_corrections,
      approach_distance: Math.round(approach_distance),
      approach_pause_ms,
    };
  }

  // --- Click event handlers ---

  _handleMouseDown(e) {
    if (!this._config.buttons.includes(e.button)) return;

    this._pending = {
      time: performance.now(),
      x: e.clientX,
      y: e.clientY,
      target: e.target,
      // Harvest approach dynamics at mousedown time (when the decision was made)
      approach: this._velocityBuf ? this._harvestApproach(e.timeStamp) : null,
    };
  }

  _handleMouseUp(e) {
    if (!this._pending) return;
    if (!this._config.buttons.includes(e.button)) return;

    this._measure(e.clientX, e.clientY, e.target);
  }

  _handleTouchStart(e) {
    if (!e.touches.length) return;
    const t = e.touches[0];

    this._pending = {
      time: performance.now(),
      x: t.clientX,
      y: t.clientY,
      target: e.target,
    };
  }

  _handleTouchEnd(e) {
    if (!this._pending) return;
    // changedTouches has the released finger
    const t = e.changedTouches?.[0];
    const x = t ? t.clientX : this._pending.x;
    const y = t ? t.clientY : this._pending.y;

    this._measure(x, y, e.target);
  }

  _measure(upX, upY, upTarget) {
    const p = this._pending;
    this._pending = null;

    const duration = performance.now() - p.time;

    // Filter: too short (programmatic) or too long (press-and-hold)
    if (duration < this._config.minDuration) return;
    if (duration > this._config.maxDuration) return;

    // Filter: drag operations
    const dx = upX - p.x;
    const dy = upY - p.y;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);
    if (dragDistance > this._config.maxDragDistance) return;

    // Build the event payload
    const event = {
      duration_ms: Math.round(duration),
      timestamp: Date.now(),
      x: Math.round(p.x),
      y: Math.round(p.y),
      drag_distance: Math.round(dragDistance),
      target: this._extractTarget(p.target),
    };

    // Attach approach dynamics if available (harvested at mousedown)
    if (p.approach) {
      event.approach = p.approach;
    }

    try {
      this._config.onCapture(event);
    } catch (err) {
      console.warn('ClickSense: onCapture threw', err);
    }
  }

  /**
   * Extract useful metadata from the click target element.
   * Walks up to find the nearest meaningful element (link, button, etc.)
   */
  _extractTarget(el) {
    // Walk up to nearest interactive or semantic element
    const meaningful = el.closest('a, button, [role="button"], input, select, label, [data-clicksense]');
    const use = meaningful || el;

    const info = {
      tag: use.tagName?.toLowerCase() || 'unknown',
    };

    if (use.id) info.id = use.id;

    // data-clicksense attribute for explicit labeling
    const label = use.getAttribute('data-clicksense');
    if (label) {
      info.label = label;
    }

    // Collect classes (truncated, skip utility-heavy frameworks)
    const classes = use.className;
    if (typeof classes === 'string' && classes.length > 0) {
      info.classes = classes.substring(0, 100);
    }

    // href for links
    if (use.tagName === 'A' && use.href) {
      info.href = use.href;
    }

    // Text content (truncated)
    if (this._config.captureText) {
      const text = (use.innerText || use.textContent || '').trim();
      if (text.length > 0) {
        info.text = text.substring(0, this._config.textMaxLength);
      }
    }

    return info;
  }
}
