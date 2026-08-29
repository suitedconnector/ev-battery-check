"use client";

import { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Calculator from "@/components/Calculator";
import DecisionResult from "@/components/DecisionResult";
import LeadForm from "@/components/LeadForm";
import { CalculatorInput } from "@/lib/types";
import { calculateDecision } from "@/lib/decision";
import { track } from "@/lib/analytics";
import { leadGenEnabled } from "@/lib/config";

type View = "form" | "result" | "lead";

export default function CalculatorPage() {
  const [view, setView] = useState<View>("form");
  const [data, setData] = useState<CalculatorInput | null>(null);

  const result = useMemo(
    () => (data ? calculateDecision(data) : null),
    [data]
  );

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

  function handleComplete(inputData: CalculatorInput) {
    const decision = calculateDecision(inputData);
    setData(inputData);
    setView("result");
    track("calculator_completed", {
      status: decision.status,
      hasQuote: decision.metrics.quoteAmount !== undefined,
    });
    track("result_viewed", { status: decision.status });
  }

  const handleFindSpecialist = leadGenEnabled
    ? () => {
        track("specialist_cta_clicked", { status: result?.status });
        setView("lead");
      }
    : undefined;

  function reset() {
    setData(null);
    setView("form");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-14">
        {view === "form" && (
          <>
            <h1 className="text-2xl font-bold text-ink mb-1">
              EV Battery Repair vs. Replace Calculator
            </h1>
            <p className="text-muted mb-8">
              Answer a few questions to see whether a repair or replacement
              makes sense — no account, no email required.
            </p>
            <Calculator onComplete={handleComplete} />
          </>
        )}

        {view === "result" && data && result && (
          <>
            <DecisionResult
              input={data}
              result={result}
              onFindSpecialist={handleFindSpecialist}
            />
            <button
              type="button"
              onClick={reset}
              className="mt-8 text-sm font-medium text-brand hover:text-brand-dark"
            >
              ← Start over
            </button>
          </>
        )}

        {view === "lead" && data && result && (
          <>
            <LeadForm input={data} result={result} />
            <button
              type="button"
              onClick={() => setView("result")}
              className="mt-8 text-sm font-medium text-brand hover:text-brand-dark"
            >
              ← Back to result
            </button>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
