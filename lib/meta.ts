import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const BASE = "https://www.vistasy.clinic";

export async function pageMeta(locale: string, key: string, path: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `Metadata.${key}` });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${BASE}/${locale}${path}`,
      languages: { en: `${BASE}/en${path}`, fr: `${BASE}/fr${path}`, "x-default": `${BASE}/en${path}` },
    },
    openGraph: { title: t("title"), description: t("description"), url: `${BASE}/${locale}${path}` },
  };
}
