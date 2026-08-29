"use client";

import { useState } from "react";
import {
  EvFormData,
  emptyFormData,
  PROBLEM_OPTIONS,
} from "@/lib/types";
import { track } from "@/lib/analytics";

interface Props {
  onComplete: (data: EvFormData) => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => CURRENT_YEAR + 1 - i);

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-base text-ink placeholder:text-faint focus:border-brand";
const labelCls = "block text-sm font-medium text-ink mb-1.5";

/** Ordered step definitions with the fields each one requires to advance. */
const STEPS = [
  { title: "Your vehicle", required: ["make", "model", "year", "mileage"] },
  { title: "Powertrain & problem", required: ["powertrain", "problem"] },
  { title: "Range (optional)", required: [] },
  { title: "History", required: ["previousBatteryRepairs"] },
] as const;

export default function Questionnaire({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [data, setData] = useState<EvFormData>(emptyFormData);

  function set<K extends keyof EvFormData>(key: K, value: EvFormData[K]) {
    if (!started) {
      setStarted(true);
      track("assessment_started");
    }
    setData((d) => ({ ...d, [key]: value }));
  }

  function numOrEmpty(v: string): number | "" {
    return v === "" ? "" : Number(v);
  }

  const required = STEPS[step].required;
  const canAdvance = required.every((k) => {
    const v = data[k as keyof EvFormData];
    return v !== "" && v !== undefined;
  });

  const isLast = step === STEPS.length - 1;

  function next() {
    if (!canAdvance) return;
    if (isLast) {
      onComplete(data);
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-faint mb-2">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span>{STEPS[step].title}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
          <div
            className="h-full bg-brand transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 0 — vehicle */}
      {step === 0 && (
        <div className="space-y-5">
          <div>
            <label htmlFor="make" className={labelCls}>
              Vehicle make
            </label>
            <input
              id="make"
              className={inputCls}
              placeholder="Tesla, Nissan, Chevrolet…"
              value={data.make}
              onChange={(e) => set("make", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="model" className={labelCls}>
              Model
            </label>
            <input
              id="model"
              className={inputCls}
              placeholder="Model 3, Leaf, Bolt…"
              value={data.model}
              onChange={(e) => set("model", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="year" className={labelCls}>
                Year
              </label>
              <select
                id="year"
                className={inputCls}
                value={data.year}
                onChange={(e) => set("year", numOrEmpty(e.target.value))}
              >
                <option value="">Select…</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="mileage" className={labelCls}>
                Approx. mileage
              </label>
              <input
                id="mileage"
                type="number"
                inputMode="numeric"
                min={0}
                className={inputCls}
                placeholder="e.g. 45000"
                value={data.mileage}
                onChange={(e) => set("mileage", numOrEmpty(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 1 — powertrain + problem */}
      {step === 1 && (
        <div className="space-y-6">
          <fieldset>
            <legend className={labelCls}>Is it a full EV or a hybrid?</legend>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["full-ev", "Full EV"],
                  ["hybrid", "Hybrid / PHEV"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set("powertrain", val)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    data.powertrain === val
                      ? "border-brand bg-brand/5 text-brand"
                      : "border-line text-ink hover:border-brand/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="problem" className={labelCls}>
              What problem are you experiencing?
            </label>
            <select
              id="problem"
              className={inputCls}
              value={data.problem}
              onChange={(e) =>
                set("problem", e.target.value as EvFormData["problem"])
              }
            >
              <option value="">Select…</option>
              {PROBLEM_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Step 2 — range (optional) */}
      {step === 2 && (
        <div className="space-y-5">
          <p className="text-sm text-muted">
            If you know these, they help sharpen the read. Leave blank if
            you&apos;re not sure — the assessment still works.
          </p>
          <div>
            <label htmlFor="currentRange" className={labelCls}>
              Current estimated full-charge range (miles)
            </label>
            <input
              id="currentRange"
              type="number"
              inputMode="numeric"
              min={0}
              className={inputCls}
              placeholder="e.g. 180"
              value={data.currentRange}
              onChange={(e) => set("currentRange", numOrEmpty(e.target.value))}
            />
          </div>
          <div>
            <label htmlFor="originalRange" className={labelCls}>
              Original estimated range when new (miles)
            </label>
            <input
              id="originalRange"
              type="number"
              inputMode="numeric"
              min={0}
              className={inputCls}
              placeholder="e.g. 260"
              value={data.originalRange}
              onChange={(e) => set("originalRange", numOrEmpty(e.target.value))}
            />
          </div>
        </div>
      )}

      {/* Step 3 — history + zip */}
      {step === 3 && (
        <div className="space-y-6">
          <fieldset>
            <legend className={labelCls}>
              Has the vehicle had any previous battery repairs?
            </legend>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  ["yes", "Yes"],
                  ["no", "No"],
                  ["unknown", "Not sure"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set("previousBatteryRepairs", val)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    data.previousBatteryRepairs === val
                      ? "border-brand bg-brand/5 text-brand"
                      : "border-line text-ink hover:border-brand/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="zip" className={labelCls}>
              ZIP code <span className="text-faint font-normal">(optional)</span>
            </label>
            <input
              id="zip"
              inputMode="numeric"
              maxLength={5}
              className={inputCls}
              placeholder="91101"
              value={data.zip}
              onChange={(e) =>
                set("zip", e.target.value.replace(/\D/g, "").slice(0, 5))
              }
            />
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="text-sm font-medium text-muted disabled:opacity-0"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canAdvance}
          className="inline-flex items-center rounded-lg bg-brand px-6 py-3 text-base font-semibold text-white hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isLast ? "See my assessment" : "Continue"}
        </button>
      </div>
    </div>
  );
}
