/**
 * Minimal analytics shim for the MVP.
 *
 * `track` just console-logs a structured event. Swap the body later for a
 * real analytics call (GA4, PostHog, Segment, etc.) without touching call
 * sites — the event names below are the contract.
 */

export type AnalyticsEvent =
  | "assessment_started"
  | "assessment_completed"
  | "specialist_cta_clicked"
  | "lead_submitted";

export function track(
  event: AnalyticsEvent,
  props: Record<string, unknown> = {}
): void {
  // eslint-disable-next-line no-console
  console.log(`[analytics] ${event}`, props);
}
