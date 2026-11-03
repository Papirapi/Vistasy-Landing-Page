import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/meta";
import { CONTACT_EMAIL } from "@/constants/navbar-items-list";
import { Section } from "@/components/section";
import { ContactForms } from "@/components/contact/contact-form";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  return pageMeta(locale, "contact", "/contact");
}

export default async function Contact({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ContactPage");
  return (
    <Section as="h1" title={t("title")} lede={t("lede")}>
      <ContactForms />
      <p className="mt-8 text-sm text-ink-3">
        {t("or")} <a href={`mailto:${CONTACT_EMAIL}`} className="v-link">{CONTACT_EMAIL}</a>
      </p>
    </Section>
  );
}
