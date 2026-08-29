import { CalculatorInput, DecisionResult as Decision } from "@/lib/types";
import { leadGenEnabled } from "@/lib/config";

interface Props {
  input: CalculatorInput;
  result: Decision;
  onFindSpecialist?: () => void;
}

const TONE = {
  green: { emoji: "🟢", ring: "border-accent/40", chip: "bg-accent/10 text-accent-dark" },
  yellow: { emoji: "🟡", ring: "border-amber-300", chip: "bg-amber-100 text-amber-800" },
  red: { emoji: "🔴", ring: "border-red-300", chip: "bg-red-100 text-red-800" },
  blue: { emoji: "🔵", ring: "border-brand/40", chip: "bg-brand/10 text-brand" },
} as const;

function money(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

/** A single big-number stat card. */
function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-faint">
        {label}
      </div>
      <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-ink">
        {value}
      </div>
      {hint && <div className="mt-0.5 text-xs text-faint">{hint}</div>}
    </div>
  );
}

export default function DecisionResult({
  input,
  result,
  onFindSpecialist,
}: Props) {
  const tone = TONE[result.tone];
  const m = result.metrics;
  const vehicle =
    [input.year, input.make === "__other__" ? "" : input.make, input.model]
      .filter((v) => v !== "" && v !== undefined)
      .join(" ") || "Your EV";

  const stats: { label: string; value: string; hint?: string }[] = [];
  if (m.vehicleValue !== undefined)
    stats.push({ label: "Vehicle value", value: money(m.vehicleValue) });
  if (m.quoteAmount !== undefined)
    stats.push({
      label: input.quoteType === "repair" ? "Repair quote" : "Battery quote",
      value: money(m.quoteAmount),
    });
  if (m.quoteToValuePct !== undefined)
    stats.push({
      label: "Quote / value",
      value: `${m.quoteToValuePct}%`,
      hint: "of the car's value",
    });
  if (m.rangeRetentionPct !== undefined)
    stats.push({
      label: "Range retention",
      value: `${m.rangeRetentionPct}%`,
      hint: "your estimate",
    });

  return (
    <div>
      <p className="text-sm text-muted">{vehicle}</p>

      {/* Decision banner */}
      <div className={`mt-2 rounded-2xl border-2 ${tone.ring} p-5 sm:p-6`}>
        <div className="text-xs font-semibold uppercase tracking-widest text-faint">
          Your battery decision
        </div>
        <h1 className="mt-2 flex items-start gap-2.5 text-2xl sm:text-3xl font-extrabold leading-tight text-ink">
          <span aria-hidden>{tone.emoji}</span>
          <span>{result.headline}</span>
        </h1>
        <p className="mt-3 text-ink leading-relaxed">{result.summary}</p>
      </div>

      {/* Big-number stats */}
      {stats.length > 0 && (
        <div
          className={`mt-5 grid gap-3 ${
            stats.length >= 3 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"
          }`}
        >
          {stats.map((s) => (
            <Stat key={s.label} {...s} />
          ))}
        </div>
      )}

      {/* What this means */}
      <section className="mt-7">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-faint">
          What this means
        </h2>
        <ul className="mt-3 space-y-3">
          {result.whatThisMeans.map((p, i) => (
            <li key={i} className="text-ink leading-relaxed">
              {p}
            </li>
          ))}
        </ul>
      </section>

      {/* Next best step */}
      <section className="mt-6 rounded-xl border border-brand/30 bg-brand/5 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
          Next best step
        </h2>
        <p className="mt-2 font-medium text-ink">{result.nextBestStep}</p>
      </section>

      {/* Warranty notice — prominent when present */}
      {result.warrantyNotice && (
        <section className="mt-6 rounded-xl border-2 border-accent/40 bg-accent/5 p-5">
          <h2 className="font-bold text-ink">✅ Check your warranty first</h2>
          <p className="mt-2 text-ink leading-relaxed">
            {result.warrantyNotice}
          </p>
        </section>
      )}

      {/* Quote analysis */}
      {result.quoteAnalysis && (
        <section className="mt-6 rounded-xl border border-line p-5">
          <h2 className="text-lg font-bold text-ink">Your quote, analyzed</h2>
          <p className="mt-2 text-ink leading-relaxed">
            {result.quoteAnalysis.percentText}{" "}
            <span className="text-muted">
              {result.quoteAnalysis.significance}
            </span>
          </p>
          {result.quoteAnalysis.batteryTypeNote && (
            <p className="mt-3 text-sm text-muted leading-relaxed">
              {result.quoteAnalysis.batteryTypeNote}
            </p>
          )}
          <p className="mt-3 text-xs text-faint">
            We can&apos;t say whether a quote is objectively fair — we don&apos;t
            have vehicle-specific pricing data. These are questions to help you
            judge it yourself.
          </p>
          <h3 className="mt-4 font-semibold text-ink">Questions to ask the shop</h3>
          <ul className="mt-2 space-y-2">
            {result.quoteAnalysis.questionsToAsk.map((q) => (
              <li key={q} className="flex gap-2 text-sm text-ink">
                <span aria-hidden className="text-brand">
                  ?
                </span>
                {q}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Used-EV due diligence */}
      {result.dueDiligence && (
        <section className="mt-6 rounded-xl border border-line p-5">
          <h2 className="text-lg font-bold text-ink">
            Ask for this before you buy
          </h2>
          <ul className="mt-3 space-y-2">
            {result.dueDiligence.map((q) => (
              <li key={q} className="flex gap-2 text-sm text-ink">
                <span aria-hidden className="text-accent">
                  ✓
                </span>
                {q}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Cost model */}
      <section className="mt-6 rounded-xl border border-line bg-surface p-5">
        <h2 className="font-bold text-ink">What repairs can cost</h2>
        <dl className="mt-3 space-y-3">
          {result.costModel.map((c) => (
            <div key={c.label}>
              <dt className="text-sm font-semibold text-ink">{c.label}</dt>
              <dd className="text-sm text-muted">{c.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-faint">
          Actual pricing varies by vehicle, battery availability, labor, and how
          repairable the pack is. These are broad ranges, not quotes.
        </p>
      </section>

      {/* Secondary specialist CTA (optional module) */}
      {leadGenEnabled && onFindSpecialist && (
        <section className="mt-8 rounded-xl border border-brand/30 bg-brand/5 p-6 text-center">
          <h2 className="text-xl font-bold text-ink">
            Want a professional battery diagnostic?
          </h2>
          <p className="mt-2 text-muted">
            Optional — connect with an EV battery specialist. The calculator is
            yours to keep either way.
          </p>
          <button
            type="button"
            onClick={onFindSpecialist}
            className="mt-5 inline-flex items-center rounded-lg bg-brand px-7 py-3.5 text-base font-semibold text-white hover:bg-brand-dark transition-colors"
          >
            Find an EV Battery Specialist
          </button>
        </section>
      )}

      {/* Disclaimer — not buried */}
      <p className="mt-6 rounded-lg bg-surface p-4 text-sm text-muted leading-relaxed">
        This calculator provides an estimate based on the information you enter.
        It does not diagnose a high-voltage battery or replace a professional
        inspection. Actual repair and replacement costs vary by vehicle and
        provider.
      </p>
    </div>
  );
}
