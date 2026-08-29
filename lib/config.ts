/**
 * Single source of truth for market + provider/CTA wiring.
 *
 * This is the ONE place to edit when the business wants to:
 *  - change the target city / service area
 *  - change the local provider or how the specialist CTA behaves
 *  - add multiple providers
 *  - attach a tracking number, shop URL, or affiliate link
 *
 * Nothing else in the app should hardcode a city name, phone number, or
 * provider. Read from here.
 */

export type CtaMode =
  | "lead-form" // opens the in-app lead form (current MVP behavior)
  | "phone" // tel: link to a single number
  | "tracking-number" // tel: link to a call-tracking number
  | "shop-url" // external link to one shop
  | "multi"; // list of providers to choose from

export interface Provider {
  id: string; // stable id — later used to tag which provider got the lead
  name: string;
  phone?: string; // e.g. "+16265550123"
  url?: string; // shop website or affiliate link
}

export interface SiteConfig {
  /** Target market — surfaced in copy + SEO. Change city here, once. */
  city: string;
  region: string; // e.g. "San Gabriel Valley"
  siteUrl: string; // canonical origin, no trailing slash

  cta: {
    /** How the specialist CTA behaves in this build. */
    mode: CtaMode;
    /**
     * Provider(s) a lead is routed to. For MVP `lead-form` mode the lead is
     * logged server-side tagged with providers[0].id, so switching providers
     * later is a data change here, not a code change.
     */
    providers: Provider[];
  };
}

export const siteConfig: SiteConfig = {
  city: "Pasadena",
  region: "San Gabriel Valley",
  siteUrl: "https://evbatterycheck.example.com",

  cta: {
    mode: "lead-form",
    providers: [
      {
        id: "default-local-specialist",
        name: "Local EV Battery Specialist",
      },
    ],
  },
};

/** The provider a lead is currently attributed to. */
export const primaryProvider = siteConfig.cta.providers[0];
