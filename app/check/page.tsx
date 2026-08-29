"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Questionnaire from "@/components/Questionnaire";
import { EvFormData } from "@/lib/types";

export default function CheckPage() {
  const [data, setData] = useState<EvFormData | null>(null);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl px-4 py-10 sm:py-14">
        {!data ? (
          <>
            <h1 className="text-2xl font-bold text-ink mb-1">
              Check your EV battery
            </h1>
            <p className="text-muted mb-8">
              A few quick questions — no account, about a minute.
            </p>
            <Questionnaire onComplete={setData} />
          </>
        ) : (
          // Temporary recap — replaced by the assessment result UI in a later step.
          <div>
            <h1 className="text-2xl font-bold text-ink mb-4">
              Answers captured
            </h1>
            <pre className="rounded-lg border border-line bg-surface p-4 text-xs text-ink overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
            <button
              type="button"
              onClick={() => setData(null)}
              className="mt-6 text-sm font-medium text-brand hover:text-brand-dark"
            >
              ← Start over
            </button>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
