/**
 * ClickSense → generic callback adapter.
 *
 * Buffers events and flushes periodically or on page unload.
 * Useful for: Adobe Analytics, custom endpoints, localStorage accumulation.
 *
 * Usage:
 *   import { createBufferedAdapter } from 'clicksense/adapters/callback';
 *   import { ClickSense } from 'clicksense';
 *
 *   new ClickSense({
 *     onCapture: createBufferedAdapter({
 *       flushInterval: 10000,   // flush every 10s
 *       onFlush: (events) => {
 *         navigator.sendBeacon('/analytics', JSON.stringify(events));
 *       }
 *     }),
 *   });
 */

/**
 * @param {object} options
 * @param {function} options.onFlush - Called with array of buffered events.
 * @param {number} [options.flushInterval=30000] - ms between auto-flushes.
 * @param {number} [options.maxBuffer=200] - Flush when buffer hits this size.
 * @returns {function} onCapture callback for ClickSense
 */
export function createBufferedAdapter({ onFlush, flushInterval = 30000, maxBuffer = 200 }) {
  let buffer = [];
  let timer = null;

  function flush() {
    if (buffer.length === 0) return;
    const batch = buffer;
    buffer = [];
    try {
      onFlush(batch);
    } catch (err) {
      console.warn('ClickSense buffered adapter: onFlush threw', err);
    }
  }

  // Periodic flush
  if (flushInterval > 0) {
    timer = setInterval(flush, flushInterval);
  }

  // Flush on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });
  }

  return function onCapture(event) {
    buffer.push(event);
    if (buffer.length >= maxBuffer) flush();
  };
}
