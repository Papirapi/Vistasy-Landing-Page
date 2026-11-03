import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pageMeta } from "@/lib/meta";
import { APP_URL } from "@/constants/navbar-items-list";
import { HeroSequence } from "@/components/home/hero-sequence";
import LogoCloud from "@/components/home/logo-cloud";
import { DispensingLabel, type LabelData } from "@/components/label";
import { Readings } from "@/components/meter";
import { VerdictBand } from "@/components/verdict";
import { PillCta } from "@/components/pill-cta";
import { Section } from "@/components/section";
import { Icon } from "@/components/icon";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  return pageMeta(locale, "home", "/home");
}

const CONCERNS = [
  { key: "texture", value: 51, img: "/products/glycolic-7-exfoliating-toner.png" },
  { key: "photodamage", value: 44, img: "/products/daily-defence-spf-50-fluid.png" },
  { key: "blemishes", value: 38, img: "/products/azelaic-acid-10-booster.png" },
  { key: "darkCircles", value: 33, img: "/products/caffeine-eye-serum.png" },
] as const;

export default async function Home({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("HomePage");
  const h = await getTranslations("HowItWorksPage");

  const concerns = CONCERNS.map((c) => ({ key: c.key, name: t(`hero.chips.${c.key}`), value: c.value }));
  const labels: Record<string, LabelData> = Object.fromEntries(
    CONCERNS.map((c) => [
      c.key,
      {
        head: t("hero.labelHead"),
        when: t("hero.labelWhen"),
        brand: t("hero.brand"),
        name: t(`hero.products.${c.key}.name`),
        meta: t(`hero.products.${c.key}.meta`),
        img: c.img,
        fields: [{ active: t(`hero.products.${c.key}.active`), holds: t(`hero.products.${c.key}.holds`), needs: t(`hero.products.${c.key}.needs`), tag: t(`hero.products.${c.key}.tag`) }],
        direction: t(`hero.products.${c.key}.direction`),
        foot: t("hero.labelFoot"),
      },
    ])
  );
  const words = t("hero.title").split(" ");

  return (
    <>
      {/* Hero: the proof on the left, the offer on the right */}
      <section className="mx-auto w-full max-w-[75rem] px-[var(--gutter)] pt-8 pb-[var(--space-section)] md:pt-14">
        <div className="grid gap-10 lg:grid-cols-[11fr_9fr] lg:items-center lg:gap-14">
          <div className="order-2 lg:order-1 lg:pr-6">
            <HeroSequence image={{ src: "/hero-section/young-woman-taking-selfie.webp", alt: t("hero.imageAlt") }} concerns={concerns} labels={labels} agree={t("hero.agree")} initial="texture" groupLabel={t("read.readings.title")} />
          </div>
          <div className="order-1 lg:order-2">
            <h1 className="settle hero-h1 max-w-[18ch]">
              {words.map((w, i) => (
                <span key={i} style={{ "--i": i } as React.CSSProperties}>{w}{i < words.length - 1 ? " " : ""}</span>
              ))}
            </h1>
            <p className="text-lede mt-6 max-w-[50ch] text-ink-2">{t("hero.lede")}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PillCta href="/contact">{t("hero.cta")}</PillCta>
              <Link href="/retailers" className="btn btn-ghost">
                {t("hero.secondary")}
                <Icon name="i-arrow-right" />
              </Link>
            </div>
            <p className="mt-3 text-sm text-ink-3">{t("hero.ctaNote")}</p>
          </div>
        </div>
      </section>

      {/* Three real artefacts */}
      <Section title={t("read.title")} className="pt-0">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="sheet flex flex-col gap-6 p-6">
            <Readings items={concerns.map((c) => ({ name: c.name, value: c.value }))} agree={t("hero.agree")} of100={t("hero.of100")} />
            <div className="mt-auto">
              <h3 className="text-title">{t("read.readings.title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{t("read.readings.text")}</p>
            </div>
          </div>
          <div className="flex flex-col gap-6 rounded-sheet bg-sheet-3 p-6">
            <DispensingLabel data={labels.blemishes} />
            <div className="mt-auto">
              <h3 className="text-title">{t("read.routine.title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{t("read.routine.text")}</p>
            </div>
          </div>
          <div className="sheet flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-3">
              <VerdictBand kind="fits" title={t("read.check.verdict")} text={t("read.check.verdictText")} />
              <VerdictBand kind="caution" title={h("steps.check.verdict")} text={h("steps.check.verdictText")} />
            </div>
            <div className="mt-auto">
              <h3 className="text-title">{t("read.check.title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{t("read.check.text")}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Independence */}
      <Section className="pt-0">
        <div className="plate plate-deep grid gap-8 p-8 md:grid-cols-[1.3fr_1fr] md:items-end md:p-12">
          <span className="halftone" aria-hidden="true" />
          <div>
            <h2 className="text-headline max-w-[20ch]">{t("independence.title")}</h2>
            <p className="mt-5 max-w-[56ch] text-ink-2">{t("independence.text")}</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <a href={`${APP_URL}/independence.html`} className="btn btn-secondary">{t("independence.linkHow")}<Icon name="i-arrow-up-right" /></a>
            <a href={`${APP_URL}/methodology.html`} className="btn btn-ghost">{t("independence.linkMethod")}</a>
          </div>
        </div>
      </Section>

      {/* Partners */}
      <Section className="pt-0">
        <LogoCloud title={t("partnersTitle")} />
      </Section>

      {/* Retailers, short */}
      <Section className="pt-0">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div>
            <h2 className="text-headline max-w-[18ch]">{t("retailers.title")}</h2>
            <p className="mt-5 max-w-[50ch] text-ink-2">{t("retailers.text")}</p>
            <p className="mt-4 max-w-[50ch] text-ink-2">{t("retailers.pilot")}</p>
            <Link href="/retailers" className="btn btn-secondary mt-8">{t("retailers.cta")}<Icon name="i-arrow-right" /></Link>
          </div>
          <ul className="sheet divide-y divide-rule-2">
            {([["widget", "i-shopping-bag"], ["store", "i-map-pin"], ["api", "i-paper-plane-right"]] as const).map(([k, icon]) => (
              <li key={k} className="flex items-center gap-4 px-5 py-4">
                <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-lav text-sticker-ink"><Icon name={icon} className="ico h-6 w-6" /></span>
                <span className="font-semibold">{t(`retailers.${k}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Close */}
      <Section className="pt-0">
        <div className="plate plate-deep p-10 text-center md:p-16">
          <span className="halftone" aria-hidden="true" />
          <h2 className="text-display mx-auto max-w-[14ch]">{t("close.title")}</h2>
          <p className="mx-auto mt-5 max-w-[44ch] text-ink-2">{t("close.text")}</p>
          <div className="mt-8 flex justify-center">
            <PillCta href="/contact">{t("close.cta")}</PillCta>
          </div>
        </div>
      </Section>
    </>
  );
}
