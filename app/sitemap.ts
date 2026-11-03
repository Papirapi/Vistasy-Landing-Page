import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const BASE = "https://www.vistasy.clinic";
const PATHS = ["/home", "/how-it-works", "/retailers", "/pricing", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((p) =>
    routing.locales.map((l) => ({
      url: `${BASE}/${l}${p}`,
      lastModified: new Date(),
      alternates: { languages: Object.fromEntries(routing.locales.map((x) => [x, `${BASE}/${x}${p}`])) },
    }))
  );
}
