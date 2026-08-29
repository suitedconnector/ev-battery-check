"use client";

import { useState } from "react";
import { Assessment, EvFormData, LeadPayload } from "@/lib/types";
import { primaryProvider, siteConfig } from "@/lib/config";
import { track } from "@/lib/analytics";

interface Props {
  data: EvFormData;
  assessment: Assessment;
}

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-base text-ink placeholder:text-faint focus:border-brand";
const labelCls = "block text-sm font-medium text-ink mb-1.5";

export default function LeadForm({ data, assessment }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zip, setZip] = useState(data.zip);
  const [description, setDescription] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );

  const canSubmit = name.trim() && email.trim() && consent && status !== "sending";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("sending");

    const payload: LeadPayload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      zip: zip.trim(),
      vehicle: { make: data.make, model: data.model, year: data.year },
      problem: data.problem,
      assessmentCategory: assessment.category,
      description: description.trim(),
      consent,
      providerId: primaryProvider.id,
      submittedAt: new Date().toISOString(),
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
        assessmentCategory: payload.assessmentCategory,
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
          Thanks — we&apos;ll connect you with a local specialist
        </h2>
        <p className="mt-2 text-muted">
          A specialist serving {siteConfig.city} and the {siteConfig.region}{" "}
          area will follow up about your {data.make} {data.model}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <h1 className="text-2xl font-bold text-ink">
        Connect with a local EV battery specialist
      </h1>
      <p className="mt-2 text-muted">
        Share your details and we&apos;ll help you get a professional answer for
        your{" "}
        <span className="font-medium text-ink">
          {[data.year, data.make, data.model].filter(Boolean).join(" ") ||
            "EV"}
        </span>
        .
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
              Phone{" "}
              <span className="text-faint font-normal">(optional)</span>
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
        <div>
          <label htmlFor="lead-desc" className={labelCls}>
            Anything else about the problem?{" "}
            <span className="text-faint font-normal">(optional)</span>
          </label>
          <textarea
            id="lead-desc"
            rows={3}
            className={inputCls}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="When it started, what you've noticed…"
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
            understand this is a preliminary assessment, not a diagnosis, and
            that a specialist will confirm any battery condition.
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
