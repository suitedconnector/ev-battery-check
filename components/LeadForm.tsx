"use client";

import { useState } from "react";
import { CalculatorInput, DecisionResult, LeadPayload } from "@/lib/types";
import { primaryProvider } from "@/lib/config";
import { track } from "@/lib/analytics";

interface Props {
  input: CalculatorInput;
  result: DecisionResult;
}

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-base text-ink placeholder:text-faint focus:border-brand";
const labelCls = "block text-sm font-medium text-ink mb-1.5";

export default function LeadForm({ input, result }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zip, setZip] = useState(input.zip);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );

  const canSubmit = name.trim() && email.trim() && consent && status !== "sending";
  const vehicleLabel =
    [input.year, input.make === "__other__" ? "" : input.make, input.model]
      .filter(Boolean)
      .join(" ") || "your EV";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("sending");

    const payload: LeadPayload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      location: zip.trim(),
      vehicle: {
        make: input.make === "__other__" ? "" : input.make,
        model: input.model,
      },
      year: input.year,
      mileage: input.mileage,
      symptoms: input.symptoms,
      rangeRetention: result.metrics.rangeRetentionPct,
      quoteAmount: result.metrics.quoteAmount,
      vehicleValue: result.metrics.vehicleValue,
      warrantyStatus: input.warranty,
      assessment: result.status,
      providerId: primaryProvider?.id ?? "unassigned",
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      track("lead_submitted", {
        providerId: payload.providerId,
        assessment: payload.assessment,
      });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-8 text-center">
        <div
          aria-hidden
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white text-2xl"
        >
          ✓
        </div>
        <h2 className="mt-4 text-xl font-bold text-ink">
          Thanks — we&apos;ll help you find a specialist
        </h2>
        <p className="mt-2 text-muted">
          A specialist will follow up about {vehicleLabel}. Nothing else is
          needed from you right now.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <h1 className="text-2xl font-bold text-ink">
        Request a professional battery diagnostic
      </h1>
      <p className="mt-2 text-muted">
        Optional. Share your details and we&apos;ll help you connect with an EV
        battery specialist for{" "}
        <span className="font-medium text-ink">{vehicleLabel}</span>. Your
        calculator result is included so they have context.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="lead-name" className={labelCls}>
            Name
          </label>
          <input
            id="lead-name"
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="lead-email" className={labelCls}>
              Email
            </label>
            <input
              id="lead-email"
              type="email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="lead-phone" className={labelCls}>
              Phone <span className="text-faint font-normal">(optional)</span>
            </label>
            <input
              id="lead-phone"
              type="tel"
              className={inputCls}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
        </div>
        <div>
          <label htmlFor="lead-zip" className={labelCls}>
            ZIP code
          </label>
          <input
            id="lead-zip"
            inputMode="numeric"
            maxLength={5}
            className={`${inputCls} max-w-40`}
            value={zip}
            onChange={(e) =>
              setZip(e.target.value.replace(/\D/g, "").slice(0, 5))
            }
          />
        </div>

        <label className="flex gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-shrink-0"
          />
          <span>
            I agree to be contacted by phone, text, or email about my request. I
            understand this is a preliminary estimate, not a diagnosis, and that
            a specialist will confirm any battery condition.
          </span>
        </label>
      </div>

      {status === "error" && (
        <p role="alert" className="mt-4 text-sm text-orange-700">
          Something went wrong sending your request. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-6 inline-flex items-center rounded-lg bg-brand px-7 py-3.5 text-base font-semibold text-white hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {status === "sending" ? "Sending…" : "Request a specialist"}
      </button>
    </form>
  );
}
