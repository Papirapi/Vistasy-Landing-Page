import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/meta";
import { APP_URL } from "@/constants/navbar-items-list";
import { Split } from "@/components/split";
import { DispensingLabel } from "@/components/label";
import { Readings } from "@/components/meter";
import { VerdictBand } from "@/components/verdict";
import { JourneyDiagram } from "@/components/diagrams/journey";
import { JourneyDraw } from "@/components/how/journey-draw";
import { StageTrack } from "@/components/how/stage-track";
import { InviteForm } from "@/components/invite-form";
import { Icon } from "@/components/icon";
import { StickyScrollCards } from "@/components/craftwork/sticky-scroll-cards";
import ScrollRevealParagraph from "@/components/craftwork/scroll-reveal-paragraph";
import { Link } from "@/i18n/navigation";
import { inviteStrings } from "@/lib/invite-strings";
import { cn } from "@/lib/utils";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  return pageMeta(locale, "howItWorks", "/how-it-works");
}

const PHASES = ["before", "read", "after"] as const;
// the seven stages in the order the app runs them, each in its phase
const STAGES = [
  { key: "consent", phase: "before" },
  { key: "selfie", phase: "before" },
  { key: "questions", phase: "before" },
  { key: "readings", phase: "read" },
  { key: "routine", phase: "read" },
  { key: "check", phase: "after" },
  { key: "progress", phase: "after" },
] as const;
type Stage = (typeof STAGES)[number]["key"];

// each limit with its icon and the matching row of the your-data page, whose title captions its card
const LIMITS = [
  { key: "where", icon: "i-globe-hemisphere-west", row: "where" },
  { key: "delete", icon: "i-trash", row: "control" },
  { key: "sarah", icon: "i-chat-teardrop-text", row: "sarah" },
] as const;

export default async function HowItWorks({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("HowItWorksPage");
  const h = await getTranslations("HomePage");
  const d = await getTranslations("DataPage");
  const invite = await inviteStrings();

  // sample values, labelled as such on every artefact that shows them
  const readings = [
    { name: h("sheet.concerns.texture"), value: 51 },
    { name: h("sheet.concerns.photodamage"), value: 44 },
    { name: h("sheet.concerns.blemishes"), value: 38 },
    { name: h("sheet.concerns.darkCircles"), value: 33 },
  ];
  const lp = (k: string) => h(`label.products.blemishes.${k}`);
  const sample = <p className="mt-3 text-micro text-ink-3">{t("sample")}</p>;

  // What the app shows at each stage, replicated from its own components. Each artefact sits on the recessed
  // plane of its card; components/how/stage-track.tsx plays its micro-demo when it comes on screen.
  const artefacts: Record<Stage, React.ReactNode> = {
    consent: (
      <div className="s1 w-full max-w-[300px] p-5">
        <span className="v-tag ok">
          <Icon name="i-check" />
          {t("steps.consent.tag1")}
        </span>
        <p className="mt-5 text-micro font-medium text-ink-3">{t("steps.consent.choice")}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          <li className="chip chip-static">{t("steps.consent.keep")}</li>
          <li className="chip chip-static" data-on="true">
            <Icon name="i-check" className="ico h-4 w-4 text-cross-ink" />
            {t("steps.consent.delete")}
          </li>
        </ul>
      </div>
    ),
    selfie: (
      <div className="photo how-photo relative aspect-[625/753] w-full max-w-[290px] shadow-[var(--edge),var(--e1)]">
        <Image src="/hero-section/young-woman-taking-selfie.webp" alt={t("steps.selfie.imageAlt")} fill sizes="(min-width: 1024px) 290px, 76vw" />
        <span className="how-face" aria-hidden="true" />
        <span className="how-scan" aria-hidden="true" />
        <span className="how-hint v-tag absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] whitespace-normal bg-sheet text-ink shadow-[var(--edge),var(--e1)]">
          <Icon name="i-check" className="ico text-good" />
          {t("steps.selfie.hint")}
        </span>
      </div>
    ),
    questions: (
      <ul className="flex max-w-[300px] flex-wrap justify-center gap-2">
        {(["q1", "q2", "q3", "q4"] as const).map((q, i) => (
          <li key={q} className="chip chip-static" data-on={i < 2 ? "true" : undefined}>
            {i < 2 && <Icon name="i-check" className="ico h-4 w-4 text-cross-ink" />}
            {t(`steps.questions.${q}`)}
          </li>
        ))}
      </ul>
    ),
    readings: (
      <div className="s1 w-full max-w-[300px] p-5">
        <Readings items={readings} agree={h("sheet.agree")} of100={h("sheet.of100")} />
        {sample}
      </div>
    ),
    routine: (
      <div className="w-full max-w-[318px]">
        <DispensingLabel
          className="sheet-lift"
          data={{
            head: lp("head"),
            when: lp("when"),
            brand: h("label.brand"),
            name: lp("name"),
            meta: lp("meta"),
            img: "/products/azelaic-acid-10-booster.png",
            // the sample dose sits on the edge of the supported range: "may be enough" reads neutral, as on the home page
            fields: [{ active: lp("active"), holds: lp("holds"), needs: lp("needs"), tag: lp("tag"), tagKind: "neutral" }],
            direction: lp("direction"),
            foot: h("label.foot"),
          }}
        />
        {sample}
      </div>
    ),
    check: (
      <div className="w-full max-w-[320px]">
        <div className="s1 p-4">
          <div className="flex items-center gap-4">
            <span className="label-img relative h-16 w-16 flex-none">
              <Image src="/products/gentle-gel-cleanser.png" alt="" width={64} height={64} />
              <span className="how-scan" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block font-medium leading-snug">{h("check.items.a.name")}</span>
              <span className="block text-small text-ink-3">{h("check.items.a.meta")}</span>
            </span>
          </div>
          <div className="mt-4">
            <VerdictBand kind="caution" title={t("steps.check.verdict")} text={t("steps.check.verdictText")} />
          </div>
        </div>
        {sample}
      </div>
    ),
    progress: (
      <div className="s1 w-full max-w-[300px] p-5">
        <div className="flex flex-wrap gap-2">
          <span className="v-tag">{t("steps.progress.premium")}</span>
          <span className="v-tag">{t("steps.progress.example")}</span>
        </div>
        <div className="mt-4 grid gap-4">
          <div data-scan="first">
            <p className="text-micro font-medium text-ink-3">{t("steps.progress.before")}</p>
            <Readings className="mt-1" items={[{ name: readings[0].name, value: 51 }, { name: readings[2].name, value: 38 }]} of100={h("sheet.of100")} />
          </div>
          <div data-scan="later">
            <p className="text-micro font-medium text-ink-3">{t("steps.progress.after")}</p>
            <Readings className="mt-1" items={[{ name: readings[0].name, value: 41 }, { name: readings[2].name, value: 29 }]} of100={h("sheet.of100")} />
          </div>
        </div>
        <p className="mt-4 text-micro text-ink-3">{h("sheet.scale")}</p>
      </div>
    ),
  };

  return (
    <>
      {/* 1. Hero: the whole journey at a glance, as an elevated object on its stage. Its wires draw in the order
             the app runs the stages (components/how/journey-draw.tsx); the plane drifts back, the card lifts. */}
      <section aria-labelledby="hiw-h" data-intro="">
        <div className="wrap pt-10 pb-[var(--space-tight)] md:pt-16">
          <Split id="hiw-h" as="h1" intro text={t("title")} className="text-hero" />
          {/* Smooth UI scroll reveal paragraph (craftwork.design): the lede reads in word by word */}
          <ScrollRevealParagraph paragraph={t("lede")} className="lede mt-5 max-w-[36rem]" data-hero-fade="" />
          <JourneyDraw className="how-hero mt-10 md:mt-14">
            <div className="stage">
              <span aria-hidden="true" className="stage-plane how-hero-plane" data-speed="clamp(0.95)" />
              <span aria-hidden="true" className="contact-shadow" style={{ bottom: "-30px" }} />
              <div data-speed="clamp(1.04)">
                <div className="how-dgm s3 px-3 py-5 sm:px-5 lg:px-6 lg:py-6">
                  <JourneyDiagram
                    id="journey"
                    locale={locale}
                    title={t("diagram.title")}
                    desc={t("diagram.label")}
                    zones={{ before: t("diagram.before"), read: t("diagram.read"), after: t("diagram.after") }}
                    nodes={STAGES.map((s) => ({ key: s.key, t: t(`diagram.nodes.${s.key}.t`), s: t(`diagram.nodes.${s.key}.s`) }))}
                    loop={t("diagram.loop")}
                    legend={{ step: t("diagram.legendStep"), loop: t("diagram.legendLoop") }}
                  />
                </div>
              </div>
            </div>
          </JourneyDraw>
        </div>
      </section>

      {/* 2. The signature scene: the seven stages as elevated cards on a horizontal journey. Wide screens pin it
             and scrub the track sideways (lib/motion.ts, data-hscroll); phones get a native scroll-snap carousel
             with the next card peeking. The phase in view is named over the bar. */}
      <StageTrack labelledBy="stages-h" phase="before" className="how-journey lg:flex lg:min-h-[calc(100dvh-var(--nav-h))] lg:flex-col lg:justify-center">
        <div className="wrap flex flex-col gap-7 pt-[var(--space-tight)] lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pt-8">
          <Split id="stages-h" text={t("journey.title")} className="text-display" />
          <div className="how-ruler w-full lg:max-w-[26rem] lg:pb-2" aria-hidden="true">
            <div className="grid grid-cols-[3fr_2fr_2fr] gap-3">
              {PHASES.map((p) => (
                <span key={p} data-ph={p} className="how-ph font-mono text-micro tracking-[0.06em] uppercase">
                  {t(`diagram.${p}`)}
                </span>
              ))}
            </div>
            <div className="hscroll-bar mt-3">
              <i />
            </div>
          </div>
        </div>
        <ol className="hscroll-track mt-6 lg:mt-9" tabIndex={0} aria-labelledby="stages-h">
          {STAGES.map((s, i) => {
            const n = PHASES.indexOf(s.phase);
            const opens = i > 0 && STAGES[i - 1].phase !== s.phase;
            return (
              // the reveal sits inside the item: the item's own box keeps the track's measured width while the
              // card is still set back (the pin measures the track once, before the cards have landed)
              <li key={s.key} className={cn("flex w-[min(84vw,400px)] lg:w-[min(60vw,680px)]", opens && "ml-3 lg:ml-10")}>
                <div data-reveal="lift" className="flex w-full">
                  <article
                    data-stage={s.key}
                    data-phase={s.phase}
                    aria-labelledby={`st-${s.key}`}
                    className="how-card s2 flex w-full flex-col overflow-hidden lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)]"
                  >
                    <div className="flex flex-col p-6 sm:p-7 lg:p-8">
                      <p className="flex items-center justify-between gap-4 text-micro text-ink-3">
                        <span className="tnum font-medium">
                          {t("step")} {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="how-dots" aria-hidden="true">
                            {PHASES.map((p, k) => (
                              <i key={p} data-on={k === n ? "" : undefined} />
                            ))}
                          </span>
                          {t(`diagram.${s.phase}`)}
                        </span>
                      </p>
                      <h3 id={`st-${s.key}`} className="text-title mt-6 max-w-[20ch]">
                        {t(`steps.${s.key}.title`)}
                      </h3>
                      <p className="mt-3 text-small text-ink-2">{t(`steps.${s.key}.text`)}</p>
                    </div>
                    <div data-shot="" className="how-shot relative flex flex-1 items-center justify-center p-5 sm:p-6">
                      {artefacts[s.key]}
                    </div>
                  </article>
                </div>
              </li>
            );
          })}
        </ol>
      </StageTrack>

      {/* 3. The limits, said plainly, as componentry sticky scroll cards (craftwork.design): each limit is a
             framed card that sticks under the header while the next slides over it, the ones below settling
             back. The referral rule leads, drawn on the app's meter as the threshold it is; each caption is the
             matching row title of the your-data page. */}
      <section aria-labelledby="safety-h" className="band">
        {/* the last card's slot already leaves space under it, so the section closes on the tighter step */}
        <div className="wrap pt-[var(--space-section)] pb-[var(--space-tight)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <Split id="safety-h" text={t("safety.title")} className="text-display max-w-[16ch]" />
            <a href={`${APP_URL}/methodology.html`} className="link-arrow flex-none">
              <span>{t("safety.link")}</span>
              <Icon name="i-arrow-up-right" />
            </a>
          </div>
          <StickyScrollCards
            className="mt-6 md:mt-10"
            cards={[
              {
                title: d("rows.medical.title"),
                content: (
                  <>
                    <Icon name="i-first-aid" className="ico h-7 w-7 text-ink-2" />
                    <p className="text-title mt-5 max-w-[30ch]">{t("safety.referral")}</p>
                    <div aria-hidden="true" className="mt-auto pt-7">
                      <p className="text-small font-medium">{h("sheet.concerns.blemishes")}</p>
                      <div className="relative mt-8" data-meters="">
                        <span className="meter how-zone" style={{ "--v": 1 } as React.CSSProperties}>
                          <i />
                        </span>
                        <span className="how-tick" />
                        <span className="how-tick-label tnum font-mono text-micro font-medium">70</span>
                      </div>
                      <p className="tnum mt-2 flex justify-between font-mono text-micro text-ink-3">
                        <span>0</span>
                        <span>100</span>
                      </p>
                      <p className="mt-3 text-micro text-ink-3">{h("sheet.scale")}</p>
                    </div>
                  </>
                ),
              },
              ...LIMITS.map((l) => ({
                title: d(`rows.${l.row}.title`),
                content: (
                  <>
                    <Icon name={l.icon} className="ico h-7 w-7 text-ink-2" />
                    <p className="text-title mt-auto max-w-[32ch] pt-8">{t(`safety.${l.key}`)}</p>
                  </>
                ),
              })),
            ]}
          />
        </div>
      </section>

      {/* 4. Close: the invite on an elevated panel set on the stage, as on the home page */}
      <section aria-labelledby="hiw-close-h">
        <div className="wrap py-[var(--space-section)]">
          <div className="stage" data-reveal="lift">
            <span aria-hidden="true" className="stage-plane how-close-plane" />
            <div className="s3 grid gap-10 p-7 sm:p-10 md:p-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-end lg:gap-16">
              <div>
                <Split id="hiw-close-h" text={t("close.title")} className="text-display max-w-[13ch]" />
                <p className="lede mt-5 max-w-[30rem]">{t("close.text")}</p>
              </div>
              <div>
                <InviteForm strings={invite} stacked />
                <p className="mt-4 flex items-start gap-2 text-small text-ink-3">
                  <Icon name="i-shield-check" className="ico mt-0.5 h-[18px] w-[18px]" />
                  <span>
                    {h("hero.note")}{" "}
                    <Link href="/your-data" className="link">
                      {h("dataLink")}
                    </Link>
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
