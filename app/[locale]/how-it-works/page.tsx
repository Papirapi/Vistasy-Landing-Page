import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/meta";
import { APP_URL } from "@/constants/navbar-items-list";
import { Section } from "@/components/section";
import { DispensingLabel } from "@/components/label";
import { Readings } from "@/components/meter";
import { VerdictBand } from "@/components/verdict";
import { PillCta } from "@/components/pill-cta";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  return pageMeta(locale, "howItWorks", "/how-it-works");
}

export default async function HowItWorks({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("HowItWorksPage");
  const h = await getTranslations("HomePage.hero");

  const readings = [
    { name: h("chips.texture"), value: 51 },
    { name: h("chips.photodamage"), value: 44 },
    { name: h("chips.blemishes"), value: 38 },
    { name: h("chips.darkCircles"), value: 33 },
  ];

  // Each step is shown with the real artefact the app produces at that point.
  const artefacts: Record<string, React.ReactNode> = {
    consent: (
      <div className="flex flex-wrap gap-2">
        <span className="v-tag ok"><Icon name="i-check" />{t("steps.consent.tag1")}</span>
        <span className="v-tag"><Icon name="i-trash" />{t("steps.consent.tag2")}</span>
      </div>
    ),
    selfie: (
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[220px]">
        <span className="absolute inset-[6%] rounded-[50%] border-2 border-dashed border-ink/40" aria-hidden="true" />
        <Icon name="i-scan-smiley" className="ico absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-ink/60" />
        <span className="v-tag absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap">{t("steps.selfie.hint")}</span>
      </div>
    ),
    questions: (
      <div className="flex flex-wrap gap-2">
        {(["q1", "q2", "q3", "q4"] as const).map((q, i) => (
          <span key={q} className="chip" aria-pressed={i < 2}>{t(`steps.questions.${q}`)}</span>
        ))}
      </div>
    ),
    readings: <Readings items={readings} agree={h("agree")} of100={h("of100")} />,
    routine: (
      <DispensingLabel
        data={{
          head: h("labelHead"),
          when: h("labelWhen"),
          brand: h("brand"),
          name: h("products.blemishes.name"),
          meta: h("products.blemishes.meta"),
          img: "/products/azelaic-acid-10-booster.png",
          fields: [{ active: h("products.blemishes.active"), holds: h("products.blemishes.holds"), needs: h("products.blemishes.needs"), tag: h("products.blemishes.tag") }],
          direction: h("products.blemishes.direction"),
          foot: h("labelFoot"),
        }}
      />
    ),
    check: <VerdictBand kind="caution" title={t("steps.check.verdict")} text={t("steps.check.verdictText")} />,
    progress: (
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-ink-3">{t("steps.progress.before")}</p>
          <Readings className="mt-1" items={[{ name: readings[0].name, value: 51 }, { name: readings[2].name, value: 38 }]} />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-3">{t("steps.progress.after")}</p>
          <Readings className="mt-1" items={[{ name: readings[0].name, value: 41 }, { name: readings[2].name, value: 29 }]} />
        </div>
      </div>
    ),
  };
  const steps = ["consent", "selfie", "questions", "readings", "routine", "check", "progress"] as const;

  return (
    <>
      <Section as="h1" title={t("title")} lede={t("lede")}>
        <ol className="grid gap-14 md:gap-20">
          {steps.map((s, i) => (
            <li key={s} className="grid gap-6 md:grid-cols-2 md:items-center md:gap-12">
              <div className={cn(i % 2 === 1 && "md:order-2")}>
                <span className="num text-sm font-bold text-cross-ink">{i + 1}</span>
                <h2 className="text-headline mt-2 max-w-[18ch]">{t(`steps.${s}.title`)}</h2>
                <p className="mt-4 max-w-[48ch] text-ink-2">{t(`steps.${s}.text`)}</p>
              </div>
              <div className={cn("rise sheet p-6 md:p-8", i % 2 === 1 && "md:order-1", s === "routine" && "bg-sheet-3")}>{artefacts[s]}</div>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="pt-0">
        <div className="plate grid gap-8 p-8 md:grid-cols-[1fr_1.4fr] md:p-12">
          <h2 className="text-headline max-w-[16ch]">{t("safety.title")}</h2>
          <div>
            <ul className="flex flex-col gap-4 text-ink-2">
              {(["referral", "where", "delete", "sarah"] as const).map((k) => (
                <li key={k} className="flex gap-3">
                  <Icon name="i-info" className="ico mt-1 h-5 w-5 shrink-0 text-cross-ink" />
                  <span>{t(`safety.${k}`)}</span>
                </li>
              ))}
            </ul>
            <a href={`${APP_URL}/methodology.html`} className="btn btn-secondary mt-8">{t("safety.link")}<Icon name="i-arrow-up-right" /></a>
          </div>
        </div>
        <div className="mt-14 flex justify-center">
          <PillCta href="/contact">{t("cta")}</PillCta>
        </div>
      </Section>
    </>
  );
}
