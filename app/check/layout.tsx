import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EV Battery Health Check",
  description:
    "Answer a few quick questions to get a preliminary read on your EV battery situation and see whether it's worth a professional diagnostic.",
  alternates: { canonical: "/check" },
};

export default function CheckLayout({ children }: LayoutProps<"/check">) {
  return children;
}
