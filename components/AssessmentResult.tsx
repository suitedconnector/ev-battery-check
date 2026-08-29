import { Assessment, EvFormData } from "@/lib/types";
import { leadGenEnabled, siteConfig } from "@/lib/config";

interface Props {
  data: EvFormData;
  assessment: Assessment;
  /** Present only when the lead-gen module is enabled. */
  onFindSpecialist?: () => void;
}

const CONFIDENCE_LABEL = {
  low: "Low confidence",
  medium: "Moderate confidence",
  high: "Higher confidence",
} as const;

const URGENCY = {
  routine: { label: "Routine — no rush", cls: "bg-accent/10 text-accent-dark" },
  soon: { label: "Worth scheduling soon", cls: "bg-amber-100 text-amber-800" },
  prompt: {
    label: "Get it looked at promptly",
    cls: "bg-orange-100 text-orange-800",
  },
} as const;

export default function AssessmentResult({
  data,
  assessment,
  onFindSpecialist,
}: Props) {
  const urgency = URGENCY[assessment.urgency];
  const vehicle = [data.year, data.make, data.model]
    .filter((v) => v !== "" && v !== undefined)
    .join(" ");

  return (
    <div>
      <p className="text-sm text-muted">{vehicle || "Your EV"}</p>
      <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-ink">
        {assessment.categoryLabel}
      </h1>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted">
          {CONFIDENCE_LABEL[assessment.confidence]}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${urgency.cls}`}
        >
          {urgency.label}
        </span>
      </div>

      {/* Why */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-faint">
          Why we&apos;re saying this
        </h2>
        <p className="mt-2 text-ink leading-relaxed">{assessment.explanation}</p>
      </section>

      {/* Next steps */}
      <section className="mt-6 rounded-xl border border-line p-5">
        <h2 className="font-semibold text-ink">Possible next steps</h2>
        <ul className="mt-3 space-y-2">
          {assessment.possibleNextSteps.map((step) => (
            <li key={step} className="flex gap-2 text-sm text-ink">
              <span aria-hidden className="text-brand">
                →
              </span>
              {step}
            </li>
          ))}
        </ul>
      </section>

      {/* Cost exposure */}
      <section className="mt-6 rounded-xl border border-line bg-surface p-5">
        <h2 className="font-semibold text-ink">Potential cost exposure</h2>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-sm text-muted">Diagnostic:</span>
          <span className="font-bold text-ink">
            {assessment.costCategory.diagnostic}
          </span>
          <span className="text-xs text-faint">(relatively low-cost)</span>
        </div>
        <p className="mt-3 text-sm text-muted leading-relaxed">
          {assessment.costCategory.summary}
        </p>
        <p className="mt-3 text-xs text-faint">
          These are general ranges to set expectations — not a quote. Only a
          professional inspection can give you real numbers.
        </p>
      </section>

      {/* Next-action CTA.
          Lead-gen is a modular add-on: when it's enabled we offer to connect
          the user with a specialist; otherwise (MVP) we give provider-neutral
          guidance so the tool never depends on having a local provider. */}
      {leadGenEnabled && onFindSpecialist ? (
        <section className="mt-8 rounded-xl border border-brand/30 bg-brand/5 p-6 text-center">
          <h2 className="text-xl font-bold text-ink">
            Want a professional answer?
          </h2>
          <p className="mt-2 text-muted">
            Connect with an EV battery specialist
            {siteConfig.leadGen.serviceAreaLabel
              ? ` in ${siteConfig.leadGen.serviceAreaLabel}`
              : ""}
            .
          </p>
          <button
            type="button"
            onClick={onFindSpecialist}
            className="mt-5 inline-flex items-center rounded-lg bg-brand px-7 py-3.5 text-base font-semibold text-white hover:bg-brand-dark transition-colors"
          >
            Find an EV Battery Specialist
          </button>
        </section>
      ) : (
        <section className="mt-8 rounded-xl border border-line bg-surface p-6">
          <h2 className="text-lg font-bold text-ink">Your next step</h2>
          <p className="mt-2 text-muted">
            Take this preliminary read to a qualified EV technician or your
            dealer&apos;s EV-certified service department for a proper
            diagnostic. Bring the details above — your symptoms, mileage, and
            any range figures — to help them zero in faster.
          </p>
        </section>
      )}

      {/* Disclaimer */}
      <p className="mt-6 text-xs text-faint leading-relaxed">
        This preliminary assessment is based only on the answers you provided.
        It is not a diagnosis and cannot measure or confirm the condition of a
        high-voltage battery. Always confirm with a qualified EV technician
        before making repair or purchase decisions.
      </p>
    </div>
  );
}
