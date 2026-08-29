"use client";

import { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Questionnaire from "@/components/Questionnaire";
import AssessmentResult from "@/components/AssessmentResult";
import LeadForm from "@/components/LeadForm";
import { EvFormData } from "@/lib/types";
import { calculateAssessment } from "@/lib/assessment";
import { track } from "@/lib/analytics";
import { leadGenEnabled } from "@/lib/config";

type View = "form" | "result" | "lead";

export default function CheckPage() {
  const [view, setView] = useState<View>("form");
  const [data, setData] = useState<EvFormData | null>(null);

  const assessment = useMemo(
    () => (data ? calculateAssessment(data) : null),
    [data]
  );

  // Each view swap replaces the whole screen — start it at the top so the
  // user isn't dropped mid-page (most visible on mobile after a bottom CTA).
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

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

  // Only wired when the lead-gen module is enabled (see lib/config.ts).
  const handleFindSpecialist = leadGenEnabled
    ? () => {
        track("specialist_cta_clicked", { category: assessment?.category });
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

        {view === "lead" && data && assessment && (
          <>
            <LeadForm data={data} assessment={assessment} />
            <button
              type="button"
              onClick={() => setView("result")}
              className="mt-8 text-sm font-medium text-brand hover:text-brand-dark"
            >
              ← Back to assessment
            </button>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
