import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const title = `EV Battery Health Check — ${siteConfig.city} & ${siteConfig.region}`;
const description = `Get a quick preliminary assessment of your EV battery situation in ${siteConfig.city} and the ${siteConfig.region}, and understand whether it's worth a professional diagnostic.`;

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
