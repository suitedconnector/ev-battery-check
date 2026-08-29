import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

// Emit a static robots.txt at build time (required under output: "export").
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
    host: siteConfig.siteUrl,
  };
}
