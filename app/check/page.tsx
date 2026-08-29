"use client";

import { useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Questionnaire from "@/components/Questionnaire";
import AssessmentResult from "@/components/AssessmentResult";
import { EvFormData } from "@/lib/types";
import { calculateAssessment } from "@/lib/assessment";
import { track } from "@/lib/analytics";

type View = "form" | "result" | "lead";

export default function CheckPage() {
  const [view, setView] = useState<View>("form");
  const [data, setData] = useState<EvFormData | null>(null);

  const assessment = useMemo(
    () => (data ? calculateAssessment(data) : null),
    [data]
  );

  function handleComplete(formData: EvFormData) {
    const result = calculateAssessment(formData);
    setData(formData);
    setView("result");
    track("assessment_completed", {
      category: result.category,
      confidence: result.confidence,
      problem: formData.problem,
    });
  }

  function handleFindSpecialist() {
    track("specialist_cta_clicked", { category: assessment?.category });
    setView("lead");
  }

  function reset() {
    setData(null);
    setView("form");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl px-4 py-10 sm:py-14">
        {view === "form" && (
          <>
            <h1 className="text-2xl font-bold text-ink mb-1">
              Check your EV battery
            </h1>
            <p className="text-muted mb-8">
              A few quick questions — no account, about a minute.
            </p>
            <Questionnaire onComplete={handleComplete} />
          </>
        )}

        {view === "result" && data && assessment && (
          <>
            <AssessmentResult
              data={data}
              assessment={assessment}
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

        {view === "lead" && (
          // Lead form is wired in the next step.
          <p className="text-muted">Lead form loads here next.</p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
