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

  // Callback — the only required option
  // Called with: { duration_ms, target, x, y, drag_distance, timestamp }
  onCapture: null,
};

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
      this._root = null;
    }
    this._pending = null;
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
  }

  _handleMouseDown(e) {
    if (!this._config.buttons.includes(e.button)) return;

    this._pending = {
      time: performance.now(),
      x: e.clientX,
      y: e.clientY,
      target: e.target,
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
