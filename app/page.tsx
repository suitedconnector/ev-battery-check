import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const steps = [
  {
    title: "Answer a few questions",
    body: "Tell us your vehicle and what you're noticing — takes about a minute.",
  },
  {
    title: "Get a preliminary read",
    body: "We classify your situation and explain the reasoning in plain language.",
  },
  {
    title: "Know your next step",
    body: "See likely next steps and rough cost exposure, so you know what to ask a technician.",
  },
];

const symptoms = [
  "Reduced driving range",
  "Battery warning light",
  "Won't charge",
  "Slow charging",
  "Sudden loss of power",
  "Fast battery drain",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "EV Battery Health Check",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  description:
    "Free preliminary EV and hybrid battery assessment: answer a few questions to see whether your battery situation is worth getting professionally diagnosed.",
  url: siteConfig.siteUrl,
  areaServed: { "@type": "Country", name: "United States" },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // Structured data for local EV-battery service search.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 pt-16 pb-14 sm:pt-24 sm:pb-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            For EV &amp; hybrid owners
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold leading-tight text-ink max-w-3xl">
            Is Your EV Battery Losing Its Charge?
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-muted max-w-2xl">
            Get a quick preliminary assessment of your EV battery situation and
            understand whether it&apos;s worth getting professionally diagnosed.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
            <Link
              href="/check"
              className="inline-flex justify-center items-center rounded-lg bg-brand px-7 py-3.5 text-base font-semibold text-white hover:bg-brand-dark transition-colors"
            >
              Check My EV
            </Link>
            <span className="text-sm text-faint">
              Free · About 1 minute · No account needed
            </span>
          </div>

          {/* Symptom chips */}
          <div className="mt-10 flex flex-wrap gap-2">
            {symptoms.map((s) => (
              <span
                key={s}
                className="rounded-full border border-line bg-surface px-3 py-1 text-sm text-muted"
              >
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-14">
            <h2 className="text-2xl font-bold text-ink">How it works</h2>
            <ol className="mt-8 grid gap-6 sm:grid-cols-3">
              {steps.map((step, i) => (
                <li
                  key={step.title}
                  className="rounded-xl border border-line bg-white p-6"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                    {i + 1}
                  </div>
                  <h3 className="mt-4 font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Trust / SEO-supporting copy */}
        <section className="mx-auto max-w-5xl px-4 py-14">
          <div className="grid gap-8 sm:grid-cols-2 items-start">
            <div>
              <h2 className="text-2xl font-bold text-ink">
                EV battery worries, explained simply
              </h2>
              <p className="mt-4 text-muted">
                Range loss, charging trouble, and battery warning lights are
                some of the most stressful — and expensive — things an EV owner
                can face. Before you assume the worst, get a clear preliminary
                read on whether your situation is worth a professional battery
                diagnostic, and what kind of cost you might be looking at.
              </p>
              <p className="mt-4 text-muted">
                It works for EV and hybrid owners anywhere in the U.S. — no
                account, no location required. Take the result to a qualified
                EV technician for a proper diagnosis.
              </p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-6">
              <h3 className="font-semibold text-ink">What this is — and isn&apos;t</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                <li className="flex gap-2">
                  <span aria-hidden className="text-accent">✓</span>
                  A plain-language, preliminary read on your situation
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="text-accent">✓</span>
                  Likely next steps and rough cost exposure
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="text-faint">✕</span>
                  Not a real battery-health measurement or diagnosis
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="text-faint">✕</span>
                  Not a repair quote
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/check"
              className="inline-flex justify-center items-center rounded-lg bg-brand px-7 py-3.5 text-base font-semibold text-white hover:bg-brand-dark transition-colors"
            >
              Check My EV
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
