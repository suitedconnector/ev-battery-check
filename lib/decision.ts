/**
 * EV Battery Repair-vs-Replace decision engine.
 *
 * Transparent, editable rules — a readable sequence of branches, not a clever
 * abstraction. This is the product's core. Tune the thresholds and copy here;
 * nothing about the decision lives in the UI.
 *
 * HARD BOUNDARIES (keep when editing):
 *  - This does NOT diagnose a high-voltage battery. It is decision support.
 *  - Range retention is the USER'S reported estimate, never a measured SoH.
 *  - Never present a threshold as medical-like certainty.
 *  - Never call a quote objectively "fair" — we have no pricing data.
 */

import {
  CalculatorInput,
  CostLine,
  DecisionResult,
  QuoteAnalysis,
  SymptomValue,
} from "./types";

// Thresholds, in one place, so they're easy to tune.
const RANGE_HEALTHY = 90; // >= this: no range red flag
const RANGE_DEGRADED = 70; // < this: notable degradation worth investigating
const QUOTE_MAJOR_PCT = 50; // quote >= this % of value: major financial decision
const QUOTE_SIGNIFICANT_PCT = 30; // >= this %: financially significant

const COST_MODEL: CostLine[] = [
  { label: "Diagnostic", value: "$ – $$" },
  {
    label: "Module-level repair",
    value:
      "Potentially hundreds to several thousand dollars, depending on the vehicle and fault.",
  },
  {
    label: "Remanufactured / used pack",
    value: "Potentially several thousand dollars.",
  },
  {
    label: "New OEM pack",
    value: "Potentially several thousand dollars or more.",
  },
];

const SHOP_QUESTIONS = [
  "Is this a complete battery pack replacement, or a module-level repair?",
  "Is the battery new, remanufactured, or used?",
  "What warranty does the replacement battery include?",
  "Are there separate diagnostic charges?",
  "Could the problem be repaired at the module level instead?",
  "What caused the battery failure?",
  "What happens if the replacement battery has another fault?",
];

const USED_EV_DUE_DILIGENCE = [
  "A recent battery health report or state-of-health readout",
  "A professional diagnostic scan for stored battery/BMS fault codes",
  "A charging test on both AC and DC fast charging",
  "Remaining battery warranty (years and miles, and whether it transfers)",
  "Service history, including any battery or module repairs",
  "Current full-charge range vs. the original rated range",
  "Any record of a previous battery replacement or module work",
];

function has(symptoms: SymptomValue[], s: SymptomValue): boolean {
  return symptoms.includes(s);
}

function num(v: number | ""): number | undefined {
  return v === "" ? undefined : v;
}

function rangeRetention(input: CalculatorInput): number | undefined {
  const orig = num(input.originalRange);
  const curr = num(input.currentRange);
  if (orig === undefined || curr === undefined || orig <= 0) return undefined;
  return Math.round((curr / orig) * 100);
}

function buildQuoteAnalysis(
  input: CalculatorInput,
  quoteAmount: number,
  vehicleValue: number | undefined
): QuoteAnalysis {
  const pct =
    vehicleValue && vehicleValue > 0
      ? Math.round((quoteAmount / vehicleValue) * 100)
      : undefined;

  let percentText: string;
  let significance: string;
  if (pct === undefined) {
    percentText =
      "Add your vehicle's estimated value to see this quote as a share of what the car is worth.";
    significance =
      "Comparing the quote to your car's value is the single most useful number here — it's worth estimating.";
  } else {
    percentText = `Your quote is about ${pct}% of your vehicle's estimated value.`;
    if (pct >= QUOTE_MAJOR_PCT) {
      significance =
        "That is a large share of the car's value — this is a major financial decision, not a routine repair.";
    } else if (pct >= QUOTE_SIGNIFICANT_PCT) {
      significance =
        "That is a significant share of the car's value and deserves careful thought.";
    } else {
      significance =
        "That is a relatively modest share of the car's value, though still a meaningful expense.";
    }
  }

  const batteryTypeNote: string | undefined = {
    "new-oem":
      "A new OEM pack is usually the most expensive option and typically carries the longest warranty.",
    reman:
      "A remanufactured pack is usually cheaper than new OEM — confirm its warranty and who stands behind it.",
    used: "A used pack is usually cheapest, but its remaining life and warranty are the biggest unknowns. Ask for its history.",
    "module-repair":
      "Module-level repair can be far cheaper than a full pack. Confirm exactly what's replaced and whether the rest of the pack is healthy.",
    unknown:
      "Ask whether the quote is for a full pack (new, reman, or used) or a module-level repair — it changes cost and risk a lot.",
    "": undefined,
  }[input.quoteBatteryType];

  return {
    quoteAmount,
    vehicleValue,
    quoteToValuePct: pct,
    percentText,
    significance,
    batteryTypeNote,
    questionsToAsk: SHOP_QUESTIONS,
  };
}

export function calculateDecision(input: CalculatorInput): DecisionResult {
  const retention = rangeRetention(input);
  const quoteAmount = num(input.quoteAmount);
  const vehicleValue = input.vehicleValueUnknown
    ? undefined
    : num(input.vehicleValue);
  const hasQuote =
    (input.quoteType === "repair" || input.quoteType === "replacement") &&
    quoteAmount !== undefined;
  const quoteToValuePct =
    hasQuote && vehicleValue && vehicleValue > 0
      ? Math.round((quoteAmount! / vehicleValue) * 100)
      : undefined;

  const serious =
    has(input.symptoms, "warning-light") ||
    has(input.symptoms, "wont-charge") ||
    has(input.symptoms, "power-loss");
  const chargingOrDrain =
    has(input.symptoms, "slow-charging") || has(input.symptoms, "fast-drain");
  const rangeDrop = has(input.symptoms, "range-drop");
  const buyingUsed = has(input.symptoms, "buying-used");
  const healthCheckOnly =
    has(input.symptoms, "health-check") &&
    !serious &&
    !chargingOrDrain &&
    !rangeDrop &&
    !hasQuote;

  const metrics = {
    rangeRetentionPct: retention,
    quoteAmount,
    vehicleValue,
    quoteToValuePct,
  };

  const warrantyNotice =
    input.warranty === "yes"
      ? "Your vehicle may still be under its battery warranty. Battery coverage is often 8 years / 100,000 miles (longer in some states). Confirm your exact coverage with the manufacturer BEFORE paying for any diagnosis or replacement — a covered failure could cost you little or nothing."
      : undefined;

  const quoteAnalysis = hasQuote
    ? buildQuoteAnalysis(input, quoteAmount!, vehicleValue)
    : undefined;

  // ---- Base result; branches below fill in status/tone/copy ----
  const base = {
    metrics,
    costModel: COST_MODEL,
    warrantyNotice,
    quoteAnalysis,
    showSpecialistCTA: true,
  };

  // 1) Used-EV mode overrides everything — the intent is buying, not repairing.
  if (buyingUsed) {
    return {
      ...base,
      mode: "used-ev",
      status: "used-ev-due-diligence",
      tone: "blue",
      headline: "BATTERY DUE DILIGENCE",
      summary:
        "Before you buy, treat the battery as the most important — and most expensive — part of the car. Get evidence of its condition rather than trusting the dashboard range alone.",
      whatThisMeans: [
        "The battery is the single biggest cost risk on a used EV. A car that looks fine can still have a weak pack.",
        "You want independent evidence of battery condition and remaining warranty before agreeing on price.",
        retention !== undefined
          ? `Based on the numbers you entered, current range is about ${retention}% of the original rating — a rough, self-reported estimate, not a measured battery health figure.`
          : "If you can, compare current full-charge range against the original rating as a rough starting point.",
      ],
      nextBestStep:
        "Request a pre-purchase EV battery inspection and a battery health/diagnostic report before you commit.",
      dueDiligence: USED_EV_DUE_DILIGENCE,
    };
  }

  // 2) Warranty + a quote/replacement in play — check coverage before paying.
  if (input.warranty === "yes" && hasQuote) {
    return {
      ...base,
      mode: "standard",
      status: "warranty-first",
      tone: "green",
      headline: "CHECK YOUR WARRANTY FIRST",
      summary:
        "You have a repair or replacement quote and told us the vehicle may still be under battery warranty. That combination means the most important step is confirming coverage before you spend anything.",
      whatThisMeans: [
        "If the failure is covered, the manufacturer may pay for some or all of the repair or replacement.",
        quoteAnalysis
          ? quoteAnalysis.percentText + " " + quoteAnalysis.significance
          : "Get your vehicle's value to weigh the quote against what the car is worth.",
        "Paying out of pocket for something a warranty would cover is the most common expensive mistake here.",
      ],
      nextBestStep:
        "Contact the manufacturer or a dealer to confirm your battery warranty status before authorizing any paid work.",
    };
  }

  // 3) A quote is on the table — make the economics the centerpiece.
  if (hasQuote) {
    const major = quoteToValuePct !== undefined && quoteToValuePct >= QUOTE_MAJOR_PCT;
    return {
      ...base,
      mode: "standard",
      status: major ? "major-financial-decision" : "get-diagnostic",
      tone: major ? "red" : "yellow",
      headline: major
        ? "A MAJOR FINANCIAL DECISION"
        : "GET A PROFESSIONAL DIAGNOSTIC",
      summary: major
        ? "Your replacement quote is a large share of what the vehicle is worth. That doesn't automatically make replacement the wrong call — but it's a decision to make with real diagnostic evidence, not a hunch."
        : "Based on what you entered, there isn't enough evidence to justify replacing the battery yet. An independent diagnostic tells you what you're actually paying to fix.",
      whatThisMeans: [
        quoteAnalysis!.percentText + " " + quoteAnalysis!.significance,
        "A replacement quote alone doesn't tell you whether the whole pack has failed. The real problem could be normal degradation, one or more weak modules/cells, a charging-system fault, or a battery-management-system issue.",
        "Knowing which of those it is can be the difference between a module-level repair and a full pack replacement.",
      ],
      nextBestStep:
        "Get an independent EV battery diagnostic before authorizing a full replacement.",
    };
  }

  // 4) Serious symptoms without a quote — recommend diagnosis, don't guess.
  if (serious) {
    return {
      ...base,
      mode: "standard",
      status: "get-diagnostic",
      tone: "yellow",
      headline: "GET A PROFESSIONAL DIAGNOSTIC",
      summary:
        "A warning light, charging failure, or power loss means the car has likely logged a fault worth reading with proper equipment. This isn't something to diagnose from the symptoms alone.",
      whatThisMeans: [
        "These symptoms can come from the high-voltage battery, the charging system, or the battery-management system — they look similar from the driver's seat.",
        "A proper diagnostic scan is the reliable way to tell whether the pack itself is the problem.",
        "Don't authorize a battery replacement until a diagnosis confirms the pack is actually the cause.",
      ],
      nextBestStep:
        "Get a professional EV battery diagnostic to read fault codes before spending on repairs.",
    };
  }

  // 5) Charging / drain symptoms — often NOT the pack; diagnose the system.
  if (chargingOrDrain) {
    return {
      ...base,
      mode: "standard",
      status: "get-diagnostic",
      tone: "yellow",
      headline: "GET A PROFESSIONAL DIAGNOSTIC",
      summary:
        "Slow charging or fast battery drain often comes from the charging equipment, the onboard charger, or the battery-management system — not necessarily worn-out cells.",
      whatThisMeans: [
        "These issues are frequently cheaper to fix than a full battery pack.",
        "A charging-system diagnosis separates an equipment or software problem from real battery degradation.",
        retention !== undefined
          ? `Your reported range is about ${retention}% of the original rating — a rough self-estimate, useful context but not a diagnosis.`
          : "Comparing current full-charge range to the original rating can add useful context.",
      ],
      nextBestStep:
        "Get a charging-system and battery diagnosis before assuming the pack needs replacing.",
    };
  }

  // 6) Range drop with numbers — quantify degradation, stay honest.
  if (rangeDrop) {
    if (retention !== undefined && retention < RANGE_DEGRADED) {
      return {
        ...base,
        mode: "standard",
        status: "degradation-watch",
        tone: "yellow",
        headline: "LIKELY BATTERY DEGRADATION — WORTH INVESTIGATING",
        summary: `Your reported range is about ${retention}% of the original rating. That's a meaningful drop worth investigating — though it's a self-reported estimate, not a measured battery health figure.`,
        whatThisMeans: [
          "Some range loss is normal as an EV ages; a large drop can indicate real capacity loss or one or more weak modules.",
          "A capacity or state-of-health test measures this properly, rather than estimating from dashboard range.",
          "Degradation this level doesn't automatically mean replacement — it means it's worth measuring before deciding.",
        ],
        nextBestStep:
          "Get a battery health / capacity test to measure actual degradation before considering replacement.",
      };
    }
    return {
      ...base,
      mode: "standard",
      status: "get-diagnostic",
      tone: "yellow",
      headline: "WORTH A BATTERY HEALTH CHECK",
      summary:
        retention !== undefined
          ? `Your reported range is about ${retention}% of the original rating — not dramatic, but you're noticing a drop, so it's worth measuring properly.`
          : "You're noticing reduced range. Without original and current range figures we can't estimate retention, so a proper battery health check is the way to quantify it.",
      whatThisMeans: [
        "Perceived range loss can be affected by weather, driving style, and speed — not only battery wear.",
        "A capacity test separates normal variation from genuine degradation.",
        "There's no sign here that a replacement is warranted yet.",
      ],
      nextBestStep:
        "Get a battery health / capacity test to see whether the drop is normal or genuine degradation.",
    };
  }

  // 7) Just checking health.
  if (healthCheckOnly) {
    if (retention !== undefined && retention >= RANGE_HEALTHY) {
      return {
        ...base,
        mode: "standard",
        status: "likely-healthy",
        tone: "green",
        headline: "NO RED FLAGS FROM WHAT YOU ENTERED",
        summary: `You reported no specific problems, and current range is about ${retention}% of the original rating. Nothing you entered points to a battery problem — though this isn't a measured diagnosis.`,
        whatThisMeans: [
          "This is a good baseline. Some gradual range loss is normal and expected.",
          "A periodic battery health check is still worthwhile before a warranty milestone or a resale.",
          "Keep an eye out for warning lights, charging trouble, or a sudden range drop.",
        ],
        nextBestStep:
          "No urgent action needed. Consider a battery health test before your warranty expires or before selling.",
      };
    }
    return {
      ...base,
      mode: "standard",
      status: retention !== undefined ? "degradation-watch" : "not-enough-info",
      tone: retention !== undefined ? "yellow" : "blue",
      headline:
        retention !== undefined
          ? "WORTH KEEPING AN EYE ON"
          : "NOT ENOUGH INFORMATION YET",
      summary:
        retention !== undefined
          ? `You reported no specific problems, but current range is about ${retention}% of the original rating — enough of a gap to measure properly at some point.`
          : "You're checking proactively, which is smart. Without symptoms or range figures there's nothing to flag — and nothing that confirms the battery is healthy either.",
      whatThisMeans: [
        "A self-reported range estimate is a rough starting point, not a battery health measurement.",
        "The only way to really know battery condition is a proper capacity / state-of-health test.",
        "There's no sign here that anything is wrong right now.",
      ],
      nextBestStep:
        "If you want certainty, get a battery health / capacity test. Otherwise, re-check if symptoms appear.",
    };
  }

  // 8) Fallback — not enough to say.
  return {
    ...base,
    mode: "standard",
    status: "not-enough-info",
    tone: "blue",
    headline: "NOT ENOUGH INFORMATION YET",
    summary:
      "There isn't enough here to point in a clear direction. A professional diagnostic is the reliable way to learn what's actually going on.",
    whatThisMeans: [
      "Add any symptoms, a range estimate, or a quote to get a more specific read.",
      "We won't pretend to know whether the pack has failed without evidence.",
    ],
    nextBestStep:
      "Get a professional EV battery diagnostic to establish a baseline.",
  };
}
