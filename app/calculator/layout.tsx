import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Battery Repair vs. Replace Calculator",
  description:
    "Free calculator: weigh an EV battery repair or replacement against your car's value and range retention, and see whether it's worth getting professionally diagnosed.",
  alternates: { canonical: "/calculator" },
};

export default function CalculatorLayout({
  children,
}: LayoutProps<"/calculator">) {
  return children;
}
