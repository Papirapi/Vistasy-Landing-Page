import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_URL as BASE } from "@/constants/navbar-items-list";


export async function pageMeta(locale: string, key: string, path: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `Metadata.${key}` });
  return {
    // the home tab is the name alone; other tabs read "VISTASY · Page" through the layout template
    title: key === "home" ? { absolute: "VISTASY" } : t("title"),
    description: t("description"),
    alternates: {
      canonical: `${BASE}/${locale}${path}`,
      languages: { en: `${BASE}/en${path}`, fr: `${BASE}/fr${path}`, "x-default": `${BASE}/en${path}` },
    },
    openGraph: { title: t("title"), description: t("description"), url: `${BASE}/${locale}${path}` },
  };
}
