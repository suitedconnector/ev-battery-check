/**
 * Minimal analytics shim for the MVP.
 *
 * `track` just console-logs a structured event. Swap the body later for a
 * real analytics call (GA4, PostHog, Segment, etc.) without touching call
 * sites — the event names below are the contract.
 */

export type AnalyticsEvent =
  | "calculator_started"
  | "calculator_completed"
  | "quote_entered"
  | "result_viewed"
  | "specialist_cta_clicked"
  | "lead_submitted";

export function track(
  event: AnalyticsEvent,
  props: Record<string, unknown> = {}
): void {
  console.log(`[analytics] ${event}`, props);
}
