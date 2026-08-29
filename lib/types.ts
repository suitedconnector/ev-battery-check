/** Shared domain types for the questionnaire, assessment engine, and lead. */

export const PROBLEM_OPTIONS = [
  { value: "reduced-range", label: "Reduced driving range" },
  { value: "warning-light", label: "Battery warning light" },
  { value: "wont-charge", label: "Car won't charge" },
  { value: "slow-charging", label: "Charging is unusually slow" },
  { value: "power-loss", label: "Sudden loss of power" },
  { value: "fast-drain", label: "Battery drains unusually fast" },
  { value: "health-check", label: "No obvious problem — just checking battery health" },
  { value: "other", label: "Other" },
] as const;

export type ProblemValue = (typeof PROBLEM_OPTIONS)[number]["value"];

export type Powertrain = "full-ev" | "hybrid";
export type YesNoUnknown = "yes" | "no" | "unknown";

export interface EvFormData {
  make: string;
  model: string;
  year: number | "";
  mileage: number | "";
  powertrain: Powertrain | "";
  problem: ProblemValue | "";
  /** Optional — user may not know these. Empty string when unknown. */
  currentRange: number | "";
  originalRange: number | "";
  previousBatteryRepairs: YesNoUnknown | "";
  zip: string;
}

export const emptyFormData: EvFormData = {
  make: "",
  model: "",
  year: "",
  mileage: "",
  powertrain: "",
  problem: "",
  currentRange: "",
  originalRange: "",
  previousBatteryRepairs: "",
  zip: "",
};

// ---- Assessment output (produced by lib/assessment.ts) ----

export type AssessmentCategory =
  | "worth-checking"
  | "possible-degradation"
  | "possible-charging-issue"
  | "possible-battery-fault"
  | "not-enough-info";

export type Confidence = "low" | "medium" | "high";
export type Urgency = "routine" | "soon" | "prompt";
export type CostTier = "$" | "$$" | "$$$";

export interface Assessment {
  category: AssessmentCategory;
  categoryLabel: string;
  confidence: Confidence;
  explanation: string;
  possibleNextSteps: string[];
  costCategory: {
    diagnostic: CostTier;
    summary: string;
  };
  urgency: Urgency;
}

// ---- Lead capture (POSTed to /api/lead) ----
// Shape kept clean + typed so it can later be forwarded to a DB or CRM
// without reworking the client.

export interface LeadPayload {
  name: string;
  email: string;
  phone?: string;
  zip: string;
  vehicle: {
    make: string;
    model: string;
    year: number | "";
  };
  problem: ProblemValue | "";
  assessmentCategory: AssessmentCategory;
  description: string;
  consent: boolean;
  /** Which configured provider this lead is attributed to. */
  providerId: string;
  /** ISO timestamp set client-side at submit. */
  submittedAt: string;
}
