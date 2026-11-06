import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pageMeta } from "@/lib/meta";
import { Split } from "@/components/split";
import { DispensingLabel, type LabelData } from "@/components/label";
import { RankFlow } from "@/components/diagrams/rank-flow";
import { VerdictDemo, type CheckItem } from "@/components/home/verdict-demo";
import { Readings } from "@/components/meter";
import { Faq } from "@/components/faq";
import { FaqJsonLd } from "@/components/seo/json-ld";
import { Icon } from "@/components/icon";
import { HighlightPhrase } from "@/components/craftwork/highlighter";
import { WidgetStage } from "@/components/retailers/widget-stage";
import { PrintOnView } from "@/components/retailers/print-on-view";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  return pageMeta(locale, "retailers", "/retailers");
}

// The shopper's read behind the hero verdict: the home page's labelled sample for blemishes
// (median of three reads, then the lowest and highest), which the azelaic acid booster answers.
const SAMPLE = { value: 38, lo: 36, hi: 41 };

// Three product pages, three verdicts. It opens on the caution: the widget is not a sales tool.
const CHECKS = [
  { key: "a", img: "/products/gentle-gel-cleanser.png", kind: "caution" },
  { key: "b", img: "/products/azelaic-acid-10-booster.png", kind: "fits" },
  { key: "c", img: "/products/barrier-repair-cream.png", kind: "neutral" },
] as const;

const RANK_STEPS = ["s1", "s2", "s3", "s4"] as const;

const STORE_STEPS = [
  { key: "s1", icon: "i-shopping-bag" },
  { key: "s2", icon: "i-user-focus" },
  { key: "s3", icon: "i-seal-check" },
  { key: "s4", icon: "i-calendar-blank" },
  { key: "s5", icon: "i-chart-line" },
] as const;

export default async function Retailers({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("RetailersPage");
  const home = await getTranslations("HomePage");
  const how = await getTranslations("HowItWorksPage");
  const plans = await getTranslations("PricingPage");

  const faq = (["q1", "q2", "q3"] as const).map((k) => ({ q: t(`faq.items.${k}.q`), a: t(`faq.items.${k}.a`) }));
  const n = (k: string) => ({ t: t(`rank.nodes.${k}.t`), s: t(`rank.nodes.${k}.s`) });
  const checks: CheckItem[] = CHECKS.map((c) => ({
    ...c,
    name: home(`check.items.${c.key}.name`),
    meta: home(`check.items.${c.key}.meta`),
    title: home(`check.items.${c.key}.title`),
    text: home(`check.items.${c.key}.text`),
  }));
  // the routine the counter tablet prints or e-mails, as the app's dispensing label (sample range)
  const r = (k: string) => home(`label.products.photodamage.${k}`);
  const routine: LabelData = {
    head: r("head"),
    when: r("when"),
    brand: home("label.brand"),
    name: r("name"),
    meta: r("meta"),
    img: "/products/daily-defence-spf-50-fluid.png",
    fields: [{ active: r("active"), holds: r("holds"), needs: r("needs"), tag: r("tag") }],
    direction: r("direction"),
    foot: home("label.foot"),
  };
  const texture = home("sheet.concerns.texture");
  const of100 = home("sheet.of100");
  const flow = {
    title: t("rank.title"),
    desc: t("rank.label"),
    catalogue: n("catalogue"),
    ranked: n("ranked"),
    stock: n("stock"),
    decide: t("rank.nodes.decide"),
    yes: t("rank.nodes.yes"),
    no: t("rank.nodes.no"),
    shown: n("shown"),
    alt: n("alt"),
  };

  return (
    <>
      {/* 1. Hero: the outcome, the pilot and the risk reversed, beside the widget staged on the shopper's product page */}
      <section aria-labelledby="ret-h" data-intro="">
        <div className="wrap grid items-center gap-x-16 gap-y-16 pt-8 pb-[var(--space-tight)] md:pt-14 lg:min-h-[calc(100dvh-var(--nav-h))] lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:py-6">
          <div>
            <Split id="ret-h" as="h1" intro text={t("title")} className="text-display max-w-[16ch]" />
            <p className="lede mt-6 max-w-[34rem]" data-hero-fade="">
              {/* Magic UI highlighter (craftwork.design): the promise is marked once the lede is in view */}
              <HighlightPhrase text={t("lede")} phrase={t("highlight")} isView />
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3" data-hero-fade="1">
              <Link href="/contact#retailers" className="btn btn-primary btn-lg">
                {t("cta")}
              </Link>
              <Link href="/pricing#retailers" className="link-arrow">
                <span>{t("secondary")}</span>
                <Icon name="i-arrow-right" />
              </Link>
            </div>
            <p className="mt-6 flex items-start gap-2 text-small text-ink-3" data-hero-fade="2">
              <Icon name="i-seal-check" className="ico mt-0.5 h-[18px] w-[18px] text-ink-3" />
              {t("risk")}
            </p>
          </div>
          <div className="mx-auto w-full max-w-[30rem] lg:max-w-none">
            <WidgetStage
              sample={SAMPLE}
              s={{
                caption: t("widget.caption"),
                brand: t("widget.brand"),
                product: t("widget.product"),
                meta: t("widget.meta"),
                verdict: t("widget.verdict"),
                verdictText: t("widget.verdictText"),
                note: t("widget.note"),
                read: home("sheet.title"),
                reading: home("sheet.concerns.blemishes"),
                of100,
                range: home.raw("sheet.range") as string,
                faceAlt: home("sheet.faceAlt"),
              }}
            />
          </div>
        </div>
      </section>

      {/* 2. Three ways in: a bento with varied cells (Magic UI bento-grid anatomy, MIT), each one elevated,
             lifting under a fine pointer and set down as it arrives; two cells carry a working product artefact */}
      <section aria-labelledby="modes-h">
        <div className="wrap py-[var(--space-section)]">
          <Split id="modes-h" text={t("modes.title")} className="text-display" />
          <div className="mt-12 grid gap-5 md:mt-16 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-7" data-reveal="lift">
              <div className="s2 lift flex h-full flex-col p-6 sm:p-8">
                <Icon name="i-shopping-bag" className="ico h-6 w-6 text-ink-2" />
                <h3 className="text-headline mt-5 max-w-[16ch]">{t("modes.widget.title")}</h3>
                <p className="mt-2 text-small font-medium text-ink-3">{t("modes.widget.effort")}</p>
                <p className="mt-4 max-w-[44ch] text-ink-2">{t("modes.widget.text")}</p>
                <div className="mt-auto pt-8">
                  <VerdictDemo items={checks} group={t("modes.widget.group")} how={t("modes.widget.how")} bare />
                </div>
              </div>
            </div>
            <div className="lg:col-span-5" data-reveal="lift">
              <div className="s1 lift flex h-full flex-col p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <Icon name="i-map-pin" className="ico h-6 w-6 text-ink-2" />
                  <span className="v-tag">{plans("retailers.enterprise.name")}</span>
                </div>
                <h3 className="text-title mt-5">{t("modes.store.title")}</h3>
                <p className="mt-1.5 text-small font-medium text-ink-3">{t("modes.store.effort")}</p>
                <p className="mt-3 text-small text-ink-2">{t("modes.store.text")}</p>
                <div className="rt-print mt-auto max-w-[22rem] pt-7">
                  <DispensingLabel data={routine} />
                </div>
              </div>
            </div>
            <div className="lg:col-span-12" data-reveal="lift">
              <div className="s1 lift grid gap-4 p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:items-center md:gap-12">
                <div className="flex items-start gap-4">
                  <Icon name="i-paper-plane-right" className="ico mt-1 h-6 w-6 text-ink-2" />
                  <div>
                    <h3 className="text-title">{t("modes.api.title")}</h3>
                    <p className="mt-1.5 text-small font-medium text-ink-3">{t("modes.api.effort")}</p>
                  </div>
                </div>
                <p className="max-w-[52ch] text-ink-2">{t("modes.api.text")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Rank first, then stock. Wide screens: the flow is pinned on its stage while the steps walk
             through it; its wires draw with the scroll as it arrives and each step lights its stage
             (scrollytelling). Narrower screens: the same flow leads in the page, then the steps follow. */}
      <section aria-labelledby="rank-h" className="band">
        <div className="wrap py-[var(--space-section)]">
          <Split id="rank-h" text={t("rank.title")} className="text-display max-w-[13ch]" />
          <p className="lede mt-6 max-w-[36rem]">{t("rank.text")}</p>
          <div className="mt-12 md:mt-16 lg:hidden" aria-hidden="true">
            <div className="stage">
              <span className="stage-plane rt-plane-rank" />
              <span className="contact-shadow" style={{ bottom: "-36px" }} />
              <div className="rt-rank-panel s3">
                <RankFlow id="rank-m" {...flow} />
              </div>
            </div>
          </div>
          <div data-scrolly="" className="rt-rank mt-10 lg:mt-16 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-20">
            <div className="scrolly-visual hidden lg:order-2 lg:block lg:self-start" aria-hidden="true">
              <div className="stage">
                <span className="stage-plane rt-plane-rank" />
                <span className="contact-shadow" style={{ bottom: "-36px" }} />
                <div className="rt-rank-panel s3">
                  <RankFlow id="rank" {...flow} hClass="hidden" vClass="mx-auto max-w-[384px]" />
                </div>
              </div>
            </div>
            <ol data-scrolly-steps="" className="lg:order-1">
              {RANK_STEPS.map((k, i) => (
                <li key={k} data-scrolly-step="" data-k={i + 1} data-on={i === 0 ? "true" : "false"} className="scrolly-step flex flex-col justify-center py-6 lg:min-h-[72vh] lg:py-8">
                  <span className="rt-num tnum text-micro font-medium">0{i + 1}</span>
                  <h3 className="text-headline mt-3 max-w-[18ch]">{t(`rank.steps.${k}.title`)}</h3>
                  <p className="rt-step-text mt-4 max-w-[40ch]">{t(`rank.steps.${k}.text`)}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 4. What changes in the store: the steps set down on a progress rail that fills with the scroll;
             the step in reading position rises one level (scroll-progress-timeline) */}
      <section aria-labelledby="steps-h">
        <div className="wrap grid gap-12 py-[var(--space-section)] lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-20">
          <Split id="steps-h" text={t("steps.title")} className="text-display max-w-[13ch]" />
          <div className="rt-steps" data-scrolly="" data-rail-scope="">
            <span className="rail" data-rail="" aria-hidden="true">
              <i />
            </span>
            <ol>
              {STORE_STEPS.map((s, i) => (
                <li key={s.key} className="rt-step" data-scrolly-step="" data-on={i === 0 ? "true" : "false"}>
                  <span className="rt-dot" aria-hidden="true" />
                  <div data-reveal="lift">
                    <div className="rt-step-card s1 lift p-6 sm:p-7">
                      <span className="flex items-center gap-3 text-ink-3">
                        <span className="tnum text-micro font-medium">0{i + 1}</span>
                        <Icon name={s.icon} className="ico h-5 w-5 text-ink-2" />
                      </span>
                      <h3 className="text-title mt-3">{t(`steps.${s.key}.title`)}</h3>
                      <p className="mt-2 max-w-[52ch] text-ink-2">{t(`steps.${s.key}.text`)}</p>
                      {s.key === "s4" && (
                        <div className="mt-6 max-w-[26rem]">
                          <div className="grid grid-cols-2 gap-5">
                            <div>
                              <p className="text-micro text-ink-3">{how("steps.progress.before")}</p>
                              <Readings className="mt-1" items={[{ name: texture, value: 51 }]} of100={of100} />
                            </div>
                            <div>
                              <p className="text-micro text-ink-3">{how("steps.progress.after")}</p>
                              <Readings className="mt-1" items={[{ name: texture, value: 41 }]} of100={of100} />
                            </div>
                          </div>
                          <p className="mt-2 text-micro text-ink-3">{how("steps.progress.example")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <p className="rt-loop text-small text-ink-3">
              <span className="rt-loop-ic" aria-hidden="true">
                <Icon name="i-arrow-clockwise" className="ico h-[18px] w-[18px]" />
              </span>
              {t("steps.loop")}
            </p>
          </div>
        </div>
      </section>

      {/* 5. The pilot, written as a label: set down on its stage, leaning toward the pointer, printing its terms */}
      <section id="pilot" aria-labelledby="pilot-h" className="band">
        <div className="wrap grid items-center gap-16 py-[var(--space-section)] lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-20">
          <div>
            <Split id="pilot-h" text={t("pilot.title")} className="text-display max-w-[13ch]" />
            <p className="lede mt-6 max-w-[32rem]">{t("pilot.text")}</p>
            <Link href="/contact#retailers" className="btn btn-primary btn-lg mt-9">
              {t("pilot.cta")}
            </Link>
          </div>
          <div className="stage mx-auto w-full max-w-[25rem] lg:mx-0">
            <span aria-hidden="true" className="stage-plane rt-plane-pilot" data-speed="clamp(0.9)" />
            <span aria-hidden="true" className="contact-shadow" style={{ bottom: "-34px" }} />
            <PrintOnView>
              <div data-tilt="4">
                <DispensingLabel
                  className="rt-pilot-label"
                  data={{
                    head: t("pilot.head"),
                    when: t("pilot.when"),
                    name: t("pilot.name"),
                    fields: [
                      { active: t("pilot.fee"), holds: t("pilot.feeV"), needs: "", tag: t("pilot.tagWaived") },
                      { active: t("pilot.ab"), holds: t("pilot.abV"), needs: "", tag: t("pilot.tagOk") },
                      { active: t("pilot.study"), holds: t("pilot.studyV"), needs: "", tag: t("pilot.tagOk") },
                    ],
                    foot: t("pilot.direction"),
                  }}
                />
              </div>
            </PrintOnView>
          </div>
        </div>
      </section>

      {/* 6. Objections */}
      <section aria-labelledby="rfaq-h">
        <div className="wrap grid gap-12 py-[var(--space-section)] lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-20">
          <Split id="rfaq-h" text={t("faq.title")} className="text-display max-w-[10ch]" />
          <Faq items={faq} />
          <FaqJsonLd items={faq} />
        </div>
      </section>

      {/* 7. Close: the button directly under its copy */}
      <section aria-labelledby="rclose-h">
        <div className="wrap pb-[var(--space-section)]">
          <div className="flex flex-col items-start gap-8 border-t border-ink pt-14 md:pt-20">
            <div>
              <Split id="rclose-h" text={t("close.title")} className="text-display max-w-[14ch]" />
              <p className="lede mt-5 max-w-[30rem]">{t("close.text")}</p>
            </div>
            <Link href="/contact#retailers" className="btn btn-primary btn-lg flex-none">
              {t("cta")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
