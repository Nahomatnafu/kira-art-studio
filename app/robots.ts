import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Crawlers must be able to see the admin page's noindex directive.
    rules: { userAgent: "*", allow: "/" },
    sitemap: siteOrigin + "/sitemap.xml",
  };
}
