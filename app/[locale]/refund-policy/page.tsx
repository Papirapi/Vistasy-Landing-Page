import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/meta";
import { LegalPage } from "@/components/legal/legal-page";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  return pageMeta(locale, "refund", "/refund-policy");
}

export default async function Page({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage docKey="refund" locale={locale} />;
}
