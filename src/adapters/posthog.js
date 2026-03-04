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
      input_type: event.input_type,
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

    // Flatten approach dynamics into top-level properties for PostHog filtering.
    // These are only present when enableApproachDynamics is true.
    if (event.approach) {
      props.approach_velocity_mean = event.approach.approach_velocity_mean;
      props.approach_velocity_final = event.approach.approach_velocity_final;
      props.approach_deceleration = event.approach.approach_deceleration;
      props.approach_corrections = event.approach.approach_corrections;
      props.approach_distance = event.approach.approach_distance;
      props.approach_pause_ms = event.approach.approach_pause_ms;
    }

    ph.capture(eventName, props);
  };
}
