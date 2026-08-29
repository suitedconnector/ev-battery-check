/**
 * Single source of truth for site + (optional) lead-generation wiring.
 *
 * The core tool is national and self-contained: it does NOT depend on having
 * a local provider. Lead generation is a modular add-on, turned off for the
 * MVP and enabled later — per market — once usage is validated.
 *
 * To turn on lead-gen later:
 *   1. set leadGen.enabled = true
 *   2. add one or more providers
 *   3. optionally set serviceAreaLabel for location-aware copy
 * Nothing else in the app hardcodes a city or provider — read from here.
 */

export type CtaMode =
  | "lead-form" // opens the in-app lead form
  | "phone" // tel: link to a single number
  | "tracking-number" // tel: link to a call-tracking number
  | "shop-url" // external link to one shop
  | "multi"; // list of providers to choose from

export interface Provider {
  id: string; // stable id — used to tag which provider got the lead
  name: string;
  phone?: string; // e.g. "+16265550123"
  url?: string; // shop website or affiliate link
}

export interface LeadGenConfig {
  /** Master switch. MVP ships with this off — the tool works without it. */
  enabled: boolean;
  /** How the specialist CTA behaves when enabled. */
  mode: CtaMode;
  /** Provider(s) a lead is routed to. Empty until lead-gen is turned on. */
  providers: Provider[];
  /**
   * Optional human label for a service area, used only in copy when enabled
   * (e.g. "the Pasadena area"). Left undefined for a nationwide rollout.
   */
  serviceAreaLabel?: string;
}

export interface SiteConfig {
  brand: string;
  /** Canonical origin, no trailing slash. */
  siteUrl: string;
  leadGen: LeadGenConfig;
}

export const siteConfig: SiteConfig = {
  brand: "EV Battery Check",
  siteUrl: "https://ev.airobotools.com",

  // Lead generation is intentionally OFF for the MVP. The assessment works
  // for EV owners anywhere in the U.S. with no provider dependency.
  leadGen: {
    enabled: false,
    mode: "lead-form",
    providers: [],
  },
};

export const leadGenEnabled = siteConfig.leadGen.enabled;

/** The provider a lead is attributed to, or null when lead-gen is off. */
export const primaryProvider: Provider | null =
  siteConfig.leadGen.providers[0] ?? null;
