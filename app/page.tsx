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
    title: "Enter your vehicle & situation",
    body: "Make, model, mileage, and what you're seeing — range loss, a warning light, a repair quote.",
  },
  {
    title: "Add a quote or value (optional)",
    body: "If you have a battery quote, we compare it against your car's value — the number that decides most cases.",
  },
  {
    title: "Get a decision, not a shrug",
    body: "A clear recommendation with the economics laid out, plus the exact questions to ask a shop.",
  },
];

const topics = [
  "Repair vs. replace",
  "Quote vs. car value",
  "Range retention",
  "Warranty check",
  "Used-EV buying",
  "Questions to ask a shop",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "EV Battery Repair vs. Replace Calculator",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  description:
    "Free calculator that weighs an EV battery repair or replacement quote against your vehicle's value and range retention, and tells you whether it's worth a professional diagnostic.",
  url: siteConfig.siteUrl,
  areaServed: { "@type": "Country", name: "United States" },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 pt-16 pb-14 sm:pt-24 sm:pb-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            EV battery repair vs. replace
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold leading-tight text-ink max-w-3xl">
            Should you repair, replace, or walk away from your EV battery?
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-muted max-w-2xl">
            A free calculator that weighs a battery repair or replacement
            against your car&apos;s value — so you understand the economics
            before you spend thousands.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
            <Link
              href="/calculator"
              className="inline-flex justify-center items-center rounded-lg bg-brand px-7 py-3.5 text-base font-semibold text-white hover:bg-brand-dark transition-colors"
            >
              Start the calculator
            </Link>
            <span className="text-sm text-faint">
              Free · About 2 minutes · No account or email needed
            </span>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {topics.map((s) => (
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
                An EV battery decision, not a guess
              </h2>
              <p className="mt-4 text-muted">
                A battery repair or replacement can cost anywhere from a modest
                electrical fix to a five-figure pack. The right call depends on
                the quote, the car&apos;s value, how much range you&apos;ve
                lost, and whether a warranty still applies. This calculator puts
                those numbers side by side and gives you a clear recommendation.
              </p>
              <p className="mt-4 text-muted">
                It works for EV and hybrid owners anywhere in the U.S. — no
                account, no email required to get your result. Buying a used EV?
                There&apos;s a mode for battery due diligence too.
              </p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-6">
              <h3 className="font-semibold text-ink">
                What this is — and isn&apos;t
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                <li className="flex gap-2">
                  <span aria-hidden className="text-accent">✓</span>
                  A decision-support tool: repair vs. replace economics
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="text-accent">✓</span>
                  Quote-vs-value analysis and questions to ask a shop
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="text-faint">✕</span>
                  Not a high-voltage battery diagnosis
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="text-faint">✕</span>
                  Not a guaranteed repair price
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/calculator"
              className="inline-flex justify-center items-center rounded-lg bg-brand px-7 py-3.5 text-base font-semibold text-white hover:bg-brand-dark transition-colors"
            >
              Start the calculator
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
