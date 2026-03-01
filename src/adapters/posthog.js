/**
 * ClickSense → PostHog adapter.
 *
 * Usage:
 *   import { createPostHogAdapter } from 'clicksense/adapters/posthog';
 *   import { ClickSense } from 'clicksense';
 *
 *   new ClickSense({
 *     onCapture: createPostHogAdapter(),       // uses window.posthog
 *     onCapture: createPostHogAdapter(posthog), // explicit instance
 *   });
 */

/**
 * @param {object} [posthogInstance] - PostHog instance. Falls back to window.posthog.
 * @param {string} [eventName='click_confidence'] - PostHog event name.
 * @returns {function} onCapture callback for ClickSense
 */
export function createPostHogAdapter(posthogInstance, eventName = 'click_confidence') {
  return function onCapture(event) {
    const ph = posthogInstance || window.posthog;

    if (!ph || typeof ph.capture !== 'function') {
      console.warn('ClickSense PostHog adapter: posthog not available');
      return;
    }

    // Flatten target into top-level properties for easier PostHog filtering
    const props = {
      duration_ms: event.duration_ms,
      click_x: event.x,
      click_y: event.y,
      drag_distance: event.drag_distance,
      target_tag: event.target.tag,
    };

    if (event.target.id) props.target_id = event.target.id;
    if (event.target.label) props.target_label = event.target.label;
    if (event.target.classes) props.target_classes = event.target.classes;
    if (event.target.href) props.target_href = event.target.href;
    if (event.target.text) props.target_text = event.target.text;

    ph.capture(eventName, props);
  };
}
