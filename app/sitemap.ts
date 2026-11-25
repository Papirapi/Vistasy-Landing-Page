import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL as BASE } from "@/constants/navbar-items-list";

// the date the content last changed, not the build time: a lastmod that moves on every deploy teaches search
// engines to ignore it. Bump it when a page changes.
const UPDATED = new Date("2026-11-25");
const PRIORITY: Record<string, number> = { "/home": 1, "/how-it-works": 0.9, "/pricing": 0.9, "/retailers": 0.8, "/contact": 0.6, "/your-data": 0.6 };

const PATHS = ["/home", "/how-it-works", "/retailers", "/pricing", "/contact", "/your-data", "/terms", "/privacy", "/refund-policy"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((p) =>
    routing.locales.map((l) => ({
      url: `${BASE}/${l}${p}`,
      lastModified: UPDATED,
      changeFrequency: p === "/home" ? "weekly" : "monthly",
      priority: PRIORITY[p] ?? 0.3,
      alternates: { languages: { ...Object.fromEntries(routing.locales.map((x) => [x, `${BASE}/${x}${p}`])), "x-default": `${BASE}/en${p}` } },
    }))
  );
}
