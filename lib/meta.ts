import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_URL as BASE } from "@/constants/navbar-items-list";

const OG_LOCALE: Record<string, string> = { en: "en_US", fr: "fr_FR" };
/** the share card: the VISTASY lockup on ink, 1200 x 630 (public/og-image.png) */
export const OG_IMAGE = { url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: "VISTASY" };

// Every page's metadata. A page's openGraph and twitter objects replace the layout's whole, so the image,
// site name and locale are set here on each page; without them no page carried a share image.
export async function pageMeta(locale: string, key: string, path: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `Metadata.${key}` });
  const url = `${BASE}/${locale}${path}`;
  // the tab shows "VISTASY" alone on the home page (the owner's choice); shares and previews get the full title
  const full = key === "home" ? `VISTASY · ${t("title")}` : `${t("title")} · VISTASY`;
  return {
    title: key === "home" ? { absolute: "VISTASY" } : t("title"),
    description: t("description"),
    alternates: {
      canonical: url,
      languages: { en: `${BASE}/en${path}`, fr: `${BASE}/fr${path}`, "x-default": `${BASE}/en${path}` },
    },
    openGraph: {
      type: "website",
      siteName: "VISTASY",
      title: full,
      description: t("description"),
      url,
      locale: OG_LOCALE[locale] ?? "en_US",
      alternateLocale: Object.entries(OG_LOCALE).filter(([l]) => l !== locale).map(([, v]) => v),
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: full, description: t("description"), images: [OG_IMAGE.url] },
  };
}
