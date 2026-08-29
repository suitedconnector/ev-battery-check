/**
 * Preliminary assessment rules engine.
 *
 * Deliberately plain and readable — a series of transparent rules, not a
 * clever abstraction. Edit the rules directly; each branch maps clearly to a
 * category, explanation, next steps, and cost tier.
 *
 * HARD BOUNDARIES (do not cross when editing):
 *  - Never claim a definitive diagnosis of a high-voltage battery.
 *  - Never output an invented battery-health percentage as if measured.
 *  - Range figures are the user's own estimates; describe them qualitatively.
 */

import {
  Assessment,
  AssessmentCategory,
  EvFormData,
} from "./types";

const CATEGORY_LABEL: Record<AssessmentCategory, string> = {
  "worth-checking": "Worth getting checked",
  "possible-degradation": "Possible battery degradation",
  "possible-charging-issue": "Possible charging / electrical issue",
  "possible-battery-fault": "Possible battery fault",
  "not-enough-info": "Not enough information to tell",
};

const NEXT_STEPS: Record<AssessmentCategory, string[]> = {
  "worth-checking": [
    "Professional EV battery diagnostic",
    "Battery health / capacity test",
  ],
  "possible-degradation": [
    "Battery health / capacity test",
    "State-of-health (SoH) measurement",
    "Professional EV battery diagnostic",
  ],
  "possible-charging-issue": [
    "Charging-system diagnosis",
    "Onboard charger & charging-equipment inspection",
    "High-voltage electrical check",
  ],
  "possible-battery-fault": [
    "High-voltage battery inspection",
    "Professional EV battery diagnostic",
    "Fault-code scan by a qualified EV technician",
  ],
  "not-enough-info": [
    "Professional EV battery diagnostic",
    "Battery health / capacity test",
  ],
};

/** Broad, non-quote cost language shared across categories. */
function costSummary(category: AssessmentCategory): string {
  if (category === "possible-charging-issue") {
    return (
      "Charging faults range widely — from a relatively small electrical or " +
      "charging-equipment repair to a larger high-voltage repair, depending on " +
      "the cause. A diagnosis is what tells the two apart."
    );
  }
  if (category === "possible-battery-fault" || category === "possible-degradation") {
    return (
      "Cost exposure is broad. It could be a smaller module or electrical " +
      "repair, or — if the high-voltage pack itself is the issue — potentially " +
      "thousands of dollars, depending on make, model, pack availability, and " +
      "whether a new, used, or remanufactured pack is appropriate."
    );
  }
  return (
    "If anything is found, repairs range from a minor electrical fix to a " +
    "major battery repair depending on the vehicle and the failure. A " +
    "diagnostic is the low-cost first step."
  );
}

/** Age of the vehicle in years, or null if year unknown. */
function vehicleAge(year: number | ""): number | null {
  if (year === "") return null;
  return new Date().getFullYear() - year;
}

/**
 * Whether the user's own current vs original range estimates show a large
 * drop. Returns "big-drop" | "mild-or-none" | "unknown". No percentage is
 * surfaced to the user — this only nudges category/confidence internally.
 */
function rangeSignal(
  current: number | "",
  original: number | ""
): "big-drop" | "mild-or-none" | "unknown" {
  if (current === "" || original === "" || original <= 0) return "unknown";
  const retention = current / original;
  return retention < 0.7 ? "big-drop" : "mild-or-none";
}

export function calculateAssessment(data: EvFormData): Assessment {
  const age = vehicleAge(data.year);
  const highMileage = data.mileage !== "" && data.mileage >= 100000;
  const older = age !== null && age >= 8;
  const range = rangeSignal(data.currentRange, data.originalRange);

  let category: AssessmentCategory;
  let confidence: Assessment["confidence"] = "medium";
  let urgency: Assessment["urgency"] = "soon";
  const reasons: string[] = [];

  switch (data.problem) {
    // ---- Charging / electrical cluster ----
    case "wont-charge":
      category = "possible-charging-issue";
      urgency = "prompt";
      reasons.push(
        "A vehicle that won't charge often points to the charging system or high-voltage electrical path rather than the battery cells themselves."
      );
      break;
    case "slow-charging":
      category = "possible-charging-issue";
      urgency = "soon";
      reasons.push(
        "Unusually slow charging can come from the charging equipment, the onboard charger, or the battery — a charging-system diagnosis separates these."
      );
      break;

    // ---- Fault cluster ----
    case "warning-light":
      category = "possible-battery-fault";
      urgency = "prompt";
      reasons.push(
        "A battery or powertrain warning light usually means the vehicle has logged a fault worth reading with proper equipment."
      );
      break;
    case "power-loss":
      category = "possible-battery-fault";
      urgency = "prompt";
      reasons.push(
        "A sudden loss of power can be safety-relevant and warrants prompt inspection by a qualified EV technician."
      );
      break;

    // ---- Degradation cluster ----
    case "reduced-range":
    case "fast-drain":
      category = "possible-degradation";
      urgency = "soon";
      reasons.push(
        data.problem === "reduced-range"
          ? "Gradually reduced driving range is the most common sign of battery capacity loss over time."
          : "A battery that drains unusually fast can reflect capacity loss or a parasitic drain — a capacity test helps tell them apart."
      );
      break;

    // ---- Proactive health check ----
    case "health-check":
      if (range === "big-drop") {
        category = "possible-degradation";
        reasons.push(
          "You reported no obvious problem, but the current range you entered is well below the original estimate, which can indicate capacity loss."
        );
      } else {
        category = "worth-checking";
        confidence = "low";
        urgency = "routine";
        reasons.push(
          "No specific problem reported. A periodic battery health check is a reasonable baseline, especially before a warranty milestone or a resale."
        );
      }
      break;

    // ---- Freeform / unknown ----
    case "other":
    case "":
    default:
      category = "not-enough-info";
      confidence = "low";
      urgency = "soon";
      reasons.push(
        "The information here isn't specific enough to classify. A professional diagnostic is the reliable way to find out what's going on."
      );
      break;
  }

  // ---- Cross-cutting confidence nudges (transparent) ----
  if (category === "possible-degradation") {
    if (range === "big-drop") {
      confidence = "high";
      reasons.push(
        "The gap between your current and original range estimates supports this."
      );
    } else if (older || highMileage) {
      confidence = "high";
      reasons.push(
        older && highMileage
          ? "Higher mileage and vehicle age both make some capacity loss more likely."
          : older
            ? "The vehicle's age makes some capacity loss more likely."
            : "Higher mileage makes some capacity loss more likely."
      );
    }
  }

  if (data.previousBatteryRepairs === "yes") {
    reasons.push(
      "A history of previous battery work is worth sharing with whoever inspects it."
    );
  }

  const diagnosticTier =
    category === "worth-checking" || category === "not-enough-info" ? "$" : "$$";

  return {
    category,
    categoryLabel: CATEGORY_LABEL[category],
    confidence,
    explanation: reasons.join(" "),
    possibleNextSteps: NEXT_STEPS[category],
    costCategory: {
      diagnostic: diagnosticTier,
      summary: costSummary(category),
    },
    urgency,
  };
}
