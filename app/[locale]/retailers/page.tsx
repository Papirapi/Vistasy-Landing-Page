import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/meta";
import { Section } from "@/components/section";
import { Steps } from "@/components/retailers/steps";
import { PillCta } from "@/components/pill-cta";
import { Icon } from "@/components/icon";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  return pageMeta(locale, "retailers", "/retailers");
}

const MODES = [
  ["widget", "i-shopping-bag"],
  ["store", "i-map-pin"],
  ["api", "i-paper-plane-right"],
] as const;

export default async function Retailers({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("RetailersPage");

  return (
    <>
      <Section as="h1" title={t("title")} lede={t("lede")}>
        <dl className="grid gap-10 md:grid-cols-3">
          {MODES.map(([k, icon]) => (
            <div key={k}>
              <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-lav text-sticker-ink"><Icon name={icon} className="ico h-6 w-6" /></span>
              <dt className="text-title mt-5">{t(`modes.${k}.title`)}</dt>
              <dd className="mt-2 max-w-[38ch] text-ink-2">{t(`modes.${k}.text`)}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section className="pt-0">
        <div className="plate plate-deep grid gap-6 p-8 md:grid-cols-[1fr_1.4fr] md:p-12">
          <span className="halftone" aria-hidden="true" />
          <h2 className="text-headline max-w-[14ch]">{t("rank.title")}</h2>
          <p className="max-w-[56ch] text-ink-2">{t("rank.text")}</p>
        </div>
      </Section>

      <Section className="pt-0">
        <Steps title={t("steps.title")} items={(["s1", "s2", "s3", "s4", "s5"] as const).map((s) => ({ title: t(`steps.${s}.title`), text: t(`steps.${s}.text`) }))} />
      </Section>

      <Section className="pt-0">
        <div className="plate plate-deep grid gap-8 p-8 md:grid-cols-[1.2fr_1fr] md:items-center md:p-12">
          <span className="halftone" aria-hidden="true" />
          <div>
            <h2 className="text-headline max-w-[16ch]">{t("pilot.title")}</h2>
            <p className="mt-5 max-w-[48ch] text-ink-2">{t("pilot.text")}</p>
          </div>
          <div className="md:justify-self-end">
            <PillCta href="/contact#retailers">{t("pilot.cta")}</PillCta>
          </div>
        </div>
      </Section>
    </>
  );
}
