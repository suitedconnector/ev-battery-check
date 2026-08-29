/** Shared domain types for the calculator, decision engine, and lead. */

import type { Powertrain } from "./vehicles";
export type { Powertrain };

// ---- Step 2: battery situation (multi-select) ----

export const SYMPTOM_OPTIONS = [
  { value: "range-drop", label: "Range has dropped significantly" },
  { value: "warning-light", label: "Battery warning light" },
  { value: "wont-charge", label: "Car won't charge" },
  { value: "slow-charging", label: "Charging is slower than normal" },
  { value: "power-loss", label: "Car loses power" },
  { value: "fast-drain", label: "Battery drains unusually fast" },
  { value: "diagnostic-done", label: "Battery diagnostic already performed" },
  { value: "have-quote", label: "I received a battery replacement quote" },
  { value: "buying-used", label: "I'm buying a used EV and want to evaluate the battery" },
  { value: "health-check", label: "I'm just checking battery health" },
] as const;

export type SymptomValue = (typeof SYMPTOM_OPTIONS)[number]["value"];

export type QuoteType = "none" | "repair" | "replacement";
export type BatteryType =
  | "new-oem"
  | "reman"
  | "used"
  | "module-repair"
  | "unknown";
export type WarrantyStatus = "yes" | "no" | "unknown";

export interface CalculatorInput {
  make: string;
  model: string;
  year: number | "";
  mileage: number | "";
  powertrain: Powertrain | "";
  symptoms: SymptomValue[];
  // Range (miles) — user-reported, optional
  originalRange: number | "";
  currentRange: number | "";
  // Quote (all optional)
  quoteType: QuoteType | "";
  quoteAmount: number | "";
  quoteBatteryType: BatteryType | "";
  // Value
  vehicleValue: number | "";
  vehicleValueUnknown: boolean;
  // Warranty
  warranty: WarrantyStatus | "";
  // Location (optional)
  zip: string;
}

export const emptyCalculatorInput: CalculatorInput = {
  make: "",
  model: "",
  year: "",
  mileage: "",
  powertrain: "",
  symptoms: [],
  originalRange: "",
  currentRange: "",
  quoteType: "",
  quoteAmount: "",
  quoteBatteryType: "",
  vehicleValue: "",
  vehicleValueUnknown: false,
  warranty: "",
  zip: "",
};

// ---- Decision engine output ----

export type DecisionTone = "green" | "yellow" | "red" | "blue";

/** Stable machine key for the decision (also sent with the lead). */
export type DecisionStatus =
  | "likely-healthy"
  | "degradation-watch"
  | "get-diagnostic"
  | "major-financial-decision"
  | "warranty-first"
  | "used-ev-due-diligence"
  | "not-enough-info";

export interface CostLine {
  label: string;
  value: string;
}

export interface QuoteAnalysis {
  quoteAmount: number;
  vehicleValue?: number;
  quoteToValuePct?: number;
  percentText: string; // human sentence about % of value (or that value is unknown)
  significance: string; // whether it reads as financially significant
  batteryTypeNote?: string; // note about new/reman/used/module
  questionsToAsk: string[];
}

export interface DecisionResult {
  mode: "standard" | "used-ev";
  status: DecisionStatus;
  tone: DecisionTone;
  headline: string; // e.g. "GET A PROFESSIONAL DIAGNOSTIC"
  summary: string;
  /** Big-number metrics for the result cards. */
  metrics: {
    rangeRetentionPct?: number; // estimate from user-reported ranges
    quoteAmount?: number;
    vehicleValue?: number;
    quoteToValuePct?: number;
  };
  whatThisMeans: string[];
  nextBestStep: string;
  quoteAnalysis?: QuoteAnalysis;
  dueDiligence?: string[]; // used-EV mode
  costModel: CostLine[];
  warrantyNotice?: string;
  showSpecialistCTA: boolean;
}

// ---- Lead capture (POSTed to /api/lead) ----
// Shape kept clean + typed so it can later be forwarded to a DB, CRM, or
// different providers without reworking the client.

export interface LeadPayload {
  // Contact (only collected if the user chooses to request help)
  name: string;
  email: string;
  phone?: string;
  location: string; // ZIP
  // Vehicle + calculator context
  vehicle: { make: string; model: string };
  year: number | "";
  mileage: number | "";
  symptoms: SymptomValue[];
  rangeRetention?: number; // percent estimate
  quoteAmount?: number;
  vehicleValue?: number;
  warrantyStatus: WarrantyStatus | "";
  assessment: DecisionStatus;
  /** Which configured provider this lead is attributed to. */
  providerId: string;
  /** ISO timestamp set client-side at submit. */
  timestamp: string;
}
