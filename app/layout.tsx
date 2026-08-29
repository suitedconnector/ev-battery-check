import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const title =
  "EV Battery Repair vs. Replace Calculator — Cost & Health Check";
const description =
  "Free EV battery calculator: weigh a repair or replacement quote against your car's value and range retention, and see whether it's worth getting professionally diagnosed. For EV & hybrid owners anywhere in the U.S.";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: title,
    template: `%s — EV Battery Check`,
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: siteConfig.siteUrl,
    siteName: "EV Battery Check",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
