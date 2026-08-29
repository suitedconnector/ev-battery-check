"use client";

import { useMemo, useState } from "react";
import {
  CalculatorInput,
  emptyCalculatorInput,
  SYMPTOM_OPTIONS,
  SymptomValue,
} from "@/lib/types";
import { MAKES, modelsForMake, findVehicle } from "@/lib/vehicles";
import { track } from "@/lib/analytics";

interface Props {
  onComplete: (input: CalculatorInput) => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => CURRENT_YEAR + 1 - i);

const input =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-base text-ink placeholder:text-faint focus:border-brand";
const label = "block text-sm font-medium text-ink mb-1.5";
const optionBtn = (active: boolean) =>
  `rounded-lg border px-4 py-3 text-sm font-medium text-left transition-colors ${
    active
      ? "border-brand bg-brand/5 text-brand"
      : "border-line text-ink hover:border-brand/50"
  }`;

const STEPS = [
  "Vehicle",
  "What's happening",
  "Range",
  "Quote",
  "Vehicle value",
  "Warranty",
];

export default function Calculator({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [d, setD] = useState<CalculatorInput>(emptyCalculatorInput);

  function set<K extends keyof CalculatorInput>(k: K, v: CalculatorInput[K]) {
    if (!started) {
      setStarted(true);
      track("calculator_started");
    }
    setD((prev) => ({ ...prev, [k]: v }));
  }

  function numOrEmpty(v: string): number | "" {
    return v === "" ? "" : Number(v);
  }

  const isOtherMake = d.make === "__other__" || (d.make !== "" && !MAKES.includes(d.make));
  const models = d.make && !isOtherMake ? modelsForMake(d.make) : [];

  function onSelectMake(make: string) {
    if (make === "__other__") {
      setD((p) => ({ ...p, make: "__other__", model: "", powertrain: "" }));
      return;
    }
    setD((p) => ({ ...p, make, model: "", powertrain: "" }));
  }

  function onSelectModel(model: string) {
    const v = findVehicle(d.make, model);
    setD((p) => ({
      ...p,
      model,
      powertrain: v ? v.powertrain : p.powertrain,
      // Prefill original range from the dataset if we have it and the user
      // hasn't already typed one. Always editable.
      originalRange:
        v?.originalRangeMi && p.originalRange === ""
          ? v.originalRangeMi
          : p.originalRange,
    }));
  }

  function toggleSymptom(s: SymptomValue) {
    setD((p) => ({
      ...p,
      symptoms: p.symptoms.includes(s)
        ? p.symptoms.filter((x) => x !== s)
        : [...p.symptoms, s],
    }));
    if (!started) {
      setStarted(true);
      track("calculator_started");
    }
  }

  const retention = useMemo(() => {
    const o = d.originalRange === "" ? undefined : d.originalRange;
    const c = d.currentRange === "" ? undefined : d.currentRange;
    if (o === undefined || c === undefined || o <= 0) return undefined;
    return Math.round((c / o) * 100);
  }, [d.originalRange, d.currentRange]);

  // Per-step gating (kept light — most fields are optional by design).
  const canAdvance = (() => {
    switch (step) {
      case 0:
        return (
          (d.make === "__other__" ? true : d.make !== "") &&
          d.model !== "" &&
          d.year !== "" &&
          d.mileage !== "" &&
          d.powertrain !== ""
        );
      case 1:
        return d.symptoms.length > 0;
      case 3:
        // If they picked a quote type, require an amount.
        return d.quoteType === "" || d.quoteType === "none" || d.quoteAmount !== "";
      case 4:
        return d.vehicleValueUnknown || d.vehicleValue !== "";
      case 5:
        return d.warranty !== "";
      default:
        return true;
    }
  })();

  const isLast = step === STEPS.length - 1;

  function next() {
    if (!canAdvance) return;
    // Fire quote_entered once when leaving the quote step with an amount.
    if (step === 3 && d.quoteAmount !== "" && d.quoteType !== "none") {
      track("quote_entered", { quoteType: d.quoteType, amount: d.quoteAmount });
    }
    if (isLast) onComplete(d);
    else setStep((s) => s + 1);
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-faint mb-2">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span>{STEPS[step]}</span>
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
            <label htmlFor="make" className={label}>
              Make
            </label>
            <select
              id="make"
              className={input}
              value={isOtherMake ? "__other__" : d.make}
              onChange={(e) => onSelectMake(e.target.value)}
            >
              <option value="">Select a make…</option>
              {MAKES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
              <option value="__other__">Other / not listed</option>
            </select>
          </div>

          <div>
            <label htmlFor="model" className={label}>
              Model
            </label>
            {isOtherMake ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  aria-label="Make"
                  className={input}
                  placeholder="Make"
                  value={d.make === "__other__" ? "" : d.make}
                  onChange={(e) => set("make", e.target.value)}
                />
                <input
                  aria-label="Model"
                  className={input}
                  placeholder="Model"
                  value={d.model}
                  onChange={(e) => set("model", e.target.value)}
                />
              </div>
            ) : (
              <select
                id="model"
                className={input}
                value={d.model}
                onChange={(e) => onSelectModel(e.target.value)}
                disabled={!d.make}
              >
                <option value="">
                  {d.make ? "Select a model…" : "Choose a make first"}
                </option>
                {models.map((m) => (
                  <option key={m.model} value={m.model}>
                    {m.model}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="year" className={label}>
                Year
              </label>
              <select
                id="year"
                className={input}
                value={d.year}
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
              <label htmlFor="mileage" className={label}>
                Mileage
              </label>
              <input
                id="mileage"
                type="number"
                inputMode="numeric"
                min={0}
                className={input}
                placeholder="e.g. 45000"
                value={d.mileage}
                onChange={(e) => set("mileage", numOrEmpty(e.target.value))}
              />
            </div>
          </div>

          <fieldset>
            <legend className={label}>Powertrain</legend>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["full-ev", "Full EV"],
                  ["hybrid", "Hybrid / PHEV"],
                ] as const
              ).map(([val, text]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set("powertrain", val)}
                  className={optionBtn(d.powertrain === val)}
                >
                  {text}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {/* Step 1 — situation (multi-select) */}
      {step === 1 && (
        <div>
          <p className="text-sm text-muted mb-4">
            Select everything that applies.
          </p>
          <div className="space-y-2">
            {SYMPTOM_OPTIONS.map((s) => {
              const active = d.symptoms.includes(s.value);
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => toggleSymptom(s.value)}
                  aria-pressed={active}
                  className={`flex w-full items-center gap-3 ${optionBtn(active)}`}
                >
                  <span
                    aria-hidden
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border text-xs ${
                      active
                        ? "border-brand bg-brand text-white"
                        : "border-gray-400"
                    }`}
                  >
                    {active ? "✓" : ""}
                  </span>
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2 — range */}
      {step === 2 && (
        <div className="space-y-5">
          <p className="text-sm text-muted">
            Optional, but this powers the range-retention estimate. We pre-fill
            the original range for known models — edit it if you know better.
          </p>
          <div>
            <label htmlFor="originalRange" className={label}>
              Original rated range when new (miles)
            </label>
            <input
              id="originalRange"
              type="number"
              inputMode="numeric"
              min={0}
              className={input}
              placeholder="e.g. 260"
              value={d.originalRange}
              onChange={(e) => set("originalRange", numOrEmpty(e.target.value))}
            />
          </div>
          <div>
            <label htmlFor="currentRange" className={label}>
              Current full-charge range (miles)
            </label>
            <input
              id="currentRange"
              type="number"
              inputMode="numeric"
              min={0}
              className={input}
              placeholder="e.g. 190"
              value={d.currentRange}
              onChange={(e) => set("currentRange", numOrEmpty(e.target.value))}
            />
          </div>
          {retention !== undefined && (
            <div className="rounded-lg border border-line bg-surface p-4">
              <div className="text-sm text-muted">
                Estimated range retention
              </div>
              <div className="mt-1 text-3xl font-extrabold text-ink">
                {retention}%
              </div>
              <p className="mt-1 text-xs text-faint">
                Estimate based on the ranges you entered — not a measured
                state-of-health.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 3 — quote */}
      {step === 3 && (
        <div className="space-y-5">
          <fieldset>
            <legend className={label}>
              Have you received a battery repair or replacement quote?
            </legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["none", "No"],
                  ["repair", "Yes — repair quote"],
                  ["replacement", "Yes — replacement quote"],
                ] as const
              ).map(([val, text]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set("quoteType", val)}
                  className={optionBtn(d.quoteType === val)}
                >
                  {text}
                </button>
              ))}
            </div>
          </fieldset>

          {(d.quoteType === "repair" || d.quoteType === "replacement") && (
            <>
              <div>
                <label htmlFor="quoteAmount" className={label}>
                  Quote amount (USD)
                </label>
                <input
                  id="quoteAmount"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  className={input}
                  placeholder="e.g. 8400"
                  value={d.quoteAmount}
                  onChange={(e) =>
                    set("quoteAmount", numOrEmpty(e.target.value))
                  }
                />
              </div>
              <fieldset>
                <legend className={label}>What kind of battery?</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      ["new-oem", "New OEM battery"],
                      ["reman", "Remanufactured battery"],
                      ["used", "Used battery"],
                      ["module-repair", "Repair / module replacement"],
                      ["unknown", "Don't know"],
                    ] as const
                  ).map(([val, text]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => set("quoteBatteryType", val)}
                      className={optionBtn(d.quoteBatteryType === val)}
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          )}
        </div>
      )}

      {/* Step 4 — vehicle value */}
      {step === 4 && (
        <div className="space-y-5">
          <p className="text-sm text-muted">
            About how much is your vehicle worth today? This lets us compare a
            quote against the car&apos;s value — the most useful number in the
            whole calculator.
          </p>
          <div>
            <label htmlFor="vehicleValue" className={label}>
              Estimated vehicle value (USD)
            </label>
            <input
              id="vehicleValue"
              type="number"
              inputMode="numeric"
              min={0}
              disabled={d.vehicleValueUnknown}
              className={`${input} disabled:opacity-50`}
              placeholder="e.g. 19000"
              value={d.vehicleValue}
              onChange={(e) => set("vehicleValue", numOrEmpty(e.target.value))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={d.vehicleValueUnknown}
              onChange={(e) => {
                const on = e.target.checked;
                setD((p) => ({
                  ...p,
                  vehicleValueUnknown: on,
                  vehicleValue: on ? "" : p.vehicleValue,
                }));
              }}
              className="h-4 w-4"
            />
            I don&apos;t know
          </label>
        </div>
      )}

      {/* Step 5 — warranty + zip */}
      {step === 5 && (
        <div className="space-y-6">
          <fieldset>
            <legend className={label}>
              Is the vehicle still covered by its battery warranty?
            </legend>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  ["yes", "Yes"],
                  ["no", "No"],
                  ["unknown", "I don't know"],
                ] as const
              ).map(([val, text]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set("warranty", val)}
                  className={optionBtn(d.warranty === val)}
                >
                  {text}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="zip" className={label}>
              ZIP code <span className="text-faint font-normal">(optional)</span>
            </label>
            <input
              id="zip"
              inputMode="numeric"
              maxLength={5}
              className={`${input} max-w-40`}
              placeholder="91101"
              value={d.zip}
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
          {isLast ? "See my result" : "Continue"}
        </button>
      </div>
    </div>
  );
}
