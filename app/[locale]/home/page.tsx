import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pageMeta } from "@/lib/meta";
import { APP_URL, CONTACT_EMAIL } from "@/constants/navbar-items-list";
import { HeroMotion } from "@/components/home/hero-motion";
import { HeroCollage } from "@/components/home/hero-collage";
import { Phone } from "@/components/home/phone";
import { MetallicLink } from "@/components/craftwork/metallic-button";
import { ContactReveal } from "@/components/craftwork/contact-reveal";
import { WebGLLiquid } from "@/components/craftwork/webgl-liquid";
import { HighlightPhrase } from "@/components/craftwork/highlighter";
import ScrollRevealParagraph from "@/components/craftwork/scroll-reveal-paragraph";
import { DispensingLabel } from "@/components/label";
import { VerdictBand } from "@/components/verdict";
import { VerdictDemo, type CheckItem } from "@/components/home/verdict-demo";
import LogoCloud from "@/components/home/logo-cloud";
import { InviteForm } from "@/components/invite-form";
import { Faq } from "@/components/faq";
import { FaqJsonLd, OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";
import { Split } from "@/components/split";
import { Icon } from "@/components/icon";
import { Readings } from "@/components/meter";
import { inviteStrings } from "@/lib/invite-strings";
import type { LabelData } from "@/components/label";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  return pageMeta(locale, "home", "/home");
}

// Illustrative values for the sample read (labelled as such on the page).
const CONCERNS = [
  // sample values: each is the median of three reads, and lo/hi are the lowest and highest read;
  // x/y place the region dot on the hero photo (percent of the photo box)
  { key: "texture", value: 51, lo: 49, hi: 54, x: 49, y: 20, img: "/products/glycolic-7-exfoliating-toner.png" },
  { key: "photodamage", value: 44, lo: 42, hi: 47, x: 55, y: 9, img: "/products/daily-defence-spf-50-fluid.png" },
  { key: "blemishes", value: 38, lo: 36, hi: 41, x: 54, y: 25, img: "/products/azelaic-acid-10-booster.png" },
  { key: "darkCircles", value: 33, lo: 31, hi: 34, x: 61, y: 16, img: "/products/caffeine-eye-serum.png" },
] as const;

// one read, in the order the app runs it (scrollytelling steps)
const STEPS = [
  { key: "selfie", icon: "i-camera" },
  { key: "readings", icon: "i-scan-smiley" },
  { key: "routine", icon: "i-list-checks" },
  { key: "check", icon: "i-barcode" },
] as const;

const TRUST = [
  { key: "consent", icon: "i-user-focus" },
  { key: "keep", icon: "i-clock-counter-clockwise" },
  { key: "where", icon: "i-globe-hemisphere-west" },
  { key: "delete", icon: "i-trash" },
] as const;

// The product check opens on the case that shows why it matters (critique round 2).
const CHECKS = [
  { key: "a", img: "/products/gentle-gel-cleanser.png", kind: "caution" },
  { key: "b", img: "/products/azelaic-acid-10-booster.png", kind: "fits" },
  { key: "c", img: "/products/barrier-repair-cream.png", kind: "neutral" },
] as const;

const RULES = [
  { key: "i1", icon: "i-prohibit" },
  { key: "i2", icon: "i-shopping-bag" },
  { key: "i3", icon: "i-seal-warning" },
  { key: "i4", icon: "i-flask" },
] as const;

// A rule reads as one strong line and its support: split after the first sentence or colon.
function lead(text: string): [string, string] {
  const m = text.match(/^(.+?[.:])\s(.+)$/);
  return m ? [m[1].replace(/:$/, "."), m[2]] : [text, ""];
}

export default async function Home({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("HomePage");
  const h = await getTranslations("HowItWorksPage");
  const d = await getTranslations("DataPage");
  const pr = await getTranslations("PricingPage");
  const nav = await getTranslations("NavBar");
  const invite = await inviteStrings();

  const concerns = CONCERNS.map((c) => ({ key: c.key, name: t(`sheet.concerns.${c.key}`), value: c.value, lo: c.lo, hi: c.hi }));
  const labels: Record<string, LabelData> = Object.fromEntries(
    CONCERNS.map((c) => {
      const p = (k: string) => t(`label.products.${c.key}.${k}`);
      return [
        c.key,
        {
          head: p("head"),
          when: p("when"),
          brand: t("label.brand"),
          name: p("name"),
          meta: p("meta"),
          img: c.img,
          // the sample azelaic dose sits on the edge of the supported range, so it reads "may be enough"
          // (the methodology's own wording): the check is seen to say so when a dose is borderline
          fields: [{ active: p("active"), holds: p("holds"), needs: p("needs"), tag: p("tag"), tagKind: c.key === "blemishes" ? "neutral" : "ok" }],
          direction: p("direction"),
          foot: t("label.foot"),
        },
      ];
    })
  );
  const checks: CheckItem[] = CHECKS.map((c) => ({
    ...c,
    name: t(`check.items.${c.key}.name`),
    meta: t(`check.items.${c.key}.meta`),
    title: t(`check.items.${c.key}.title`),
    text: t(`check.items.${c.key}.text`),
  }));
  // answered elsewhere on the page are left out: the photo (bento), ranking (independence), scan time (steps)
  const faq = ["q1", "q5", "q6", "q7", "q8"].map((k) => ({ q: t(`faq.items.${k}.q`), a: t(`faq.items.${k}.a`) }));

  return (
    <>
      <OrganizationJsonLd locale={locale} />
      <WebSiteJsonLd locale={locale} />

      {/* 1 + 2. The hero and the read, as one scene: the app on a phone in the middle of interactive cards
          (the reference the owner chose), then the same phone travels the whole page with the reader, to the
          closing invite: beside the four steps of a read, then each section in turn, turning to show the next
          screen and changing size (gsap.com/scroll: something always follows you). Every section leaves it a
          lane on the right ([data-lane]), so it never passes over what you are reading. */}
      <div data-follow="">
        <HeroMotion className="relative pt-4 md:pt-6">
          <HeroCollage
            copy={
              <div className="c-card p-7 sm:p-8">
                <p className="eyebrow" data-hero-fade="">
                  <span className="eb-ic" aria-hidden="true">
                    <Icon name="i-scan-smiley-fill" className="ico" />
                  </span>
                  {t("hero.eyebrow")}
                </p>
                <Split as="h1" intro text={t("hero.title")} className="text-display mt-5" />
                <p className="mt-4 text-ink-2" data-hero-fade="">
                  {t("hero.lede")}
                </p>
                <div className="mt-6" data-hero-fade="1">
                  <InviteForm strings={invite} stacked icon />
                </div>
                <ul className="mt-5 flex flex-wrap items-center gap-2" data-hero-fade="2">
                  <li className="fact-chip">
                    <Icon name="i-check" className="ico" />
                    {t("hero.chips.free")}
                  </li>
                  <li className="fact-chip">
                    <Icon name="i-shield-check" className="ico" />
                    {t("hero.chips.photo")}
                  </li>
                  <li className="ml-1">
                    <Link href="/your-data" className="link text-small">
                      {t("dataLink")}
                    </Link>
                  </li>
                </ul>
              </div>
            }
            phone={
              <Phone
                person={{ src: "/hero-section/young-woman-taking-selfie.webp", alt: h("steps.selfie.imageAlt") }}
                readings={concerns}
                label={labels.texture}
                check={{ img: CHECKS[0].img, name: checks[0].name, meta: checks[0].meta, title: checks[0].title, text: checks[0].text }}
                s={{ selfie: t("hero.phone.selfie"), product: t("hero.phone.product"), gate: t("hero.phone.gate"), title: t("sheet.title"), meta: t("sheet.meta"), agree: t("sheet.agree"), shown: t("sheet.shown"), quality: t("sheet.quality"), shutter: t("hero.phone.shutter") }}
              />
            }
            products={checks.map((c) => ({ key: c.key, img: c.img, name: c.name, meta: c.meta, kind: c.kind, title: c.title }))}
            readings={concerns}
            s={{
              check: t("hero.cards.check"), save: t("hero.cards.save"), saved: t("hero.cards.saved"), next: t("hero.cards.next"), range: t.raw("sheet.range") as string,
              monthly: t("hero.cards.monthly"), yearly: t("hero.cards.yearly"), monthPrice: pr("people.premium.priceMonthly"), perMonth: pr("perMonth"), yearPrice: t("hero.cards.yearPrice"), perYear: t("hero.cards.perYear"),
              premium: t("hero.cards.premium"), consent: t("hero.cards.consent"), keep: h("steps.consent.keep"), del: h("steps.consent.delete"), ask: t("hero.cards.ask"), grades: t("hero.cards.grades"),
              gradeText: { a: t("bento.evidence.a"), b: t("bento.evidence.b"), c: t("bento.evidence.c") }, gate: [t("plan.gate.light"), t("plan.gate.pose"), t("plan.gate.focus")], quality: t("sheet.quality"), again: t("hero.cards.again"),
              free: t("hero.chips.free"), freeLink: nav("pricing"), retailTitle: t("retailers.title"), retailCta: nav("ctaRetail"),
              faq: ["q1", "q5", "q8"].map((k) => ({ q: t(`faq.items.${k}.q`), a: t(`faq.items.${k}.a`) })),
              before: h("steps.progress.before"), after: h("steps.progress.after"), sample: h("steps.progress.example"), compare: t("hero.cards.compare"), deck: t("hero.cards.deck"), nextProduct: t("hero.cards.nextProduct"),
            }}
          />
        </HeroMotion>

        <section aria-labelledby="plan-h" className="follow-steps" data-journey="" data-journey-size="1" data-journey-from="0" data-journey-end="top 80%">
          <div className="wrap relative pt-[var(--space-tight)] pb-[var(--space-tight)]">
            <span className="lane-mark half" data-lane="" aria-hidden="true" />
            <div className="lg:w-1/2 lg:pr-10">
              <Split id="plan-h" text={t("plan.title")} className="text-display max-w-[15ch]" />
              <MetallicLink href="/how-it-works" className="mt-6">
                {t("plan.more")}
                <Icon name="i-arrow-right" className="ico" />
              </MetallicLink>
            </div>
            <div data-follow-steps="" data-stack="" className="stack mt-10 lg:w-1/2 lg:pr-10">
              {STEPS.map((s, i) => (
                <article key={s.key} data-follow-step="" className="stack-card s2 p-7 sm:p-8">
                  <span className="flex items-center gap-3">
                    <span className="tnum grid h-9 w-9 place-items-center rounded-full bg-shell text-micro font-semibold text-on-shell">0{i + 1}</span>
                    <Icon name={s.icon} className="ico h-5 w-5 text-ink-2" />
                  </span>
                  <h3 className="text-headline mt-5 max-w-[18ch]">{t(`plan.steps.${s.key}.title`)}</h3>
                  <p className="mt-3 max-w-[44ch] text-ink-2">{t(`plan.steps.${s.key}.text`)}</p>
                  <div className="follow-inline mt-6">
                    {s.key === "selfie" && (
                      <ul className="flex flex-wrap gap-2">
                        {[t("plan.gate.light"), t("plan.gate.pose"), t("plan.gate.focus")].map((g) => (
                          <li key={g} className="v-tag ok">
                            <Icon name="i-check" />
                            {g}
                          </li>
                        ))}
                      </ul>
                    )}
                    {s.key === "readings" && <Readings items={concerns.map((c) => ({ name: c.name, value: c.value }))} agree={t("sheet.agree")} of100={t("sheet.of100")} />}
                    {s.key === "routine" && (
                      <div className="max-w-[320px]">
                        <DispensingLabel data={labels.texture} className="sheet-lift" />
                      </div>
                    )}
                    {s.key === "check" && <VerdictBand kind="caution" title={checks[0].title} text={checks[0].text} />}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* 3. What one read gives you: a bento anchored by the live product check (Magic UI bento anatomy) */}
      <section aria-labelledby="get-h" className="band" data-journey="" data-journey-size="0.86" data-journey-panel="1" data-journey-turn="">
        <div className="wrap lane-r relative py-[var(--space-section)]">
          <span className="lane-mark" data-lane="" aria-hidden="true" />
          <Split id="get-h" text={t("bento.title")} className="text-display max-w-[15ch]" />
          <div className="bento mt-12 grid gap-5 md:mt-16 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-7 lg:row-span-2" data-reveal="lift">
              <article className="s2 lift flex h-full flex-col p-6 sm:p-8">
                <h3 className="text-headline max-w-[15ch]">{t("check.title")}</h3>
                <p className="mt-3 max-w-[44ch] text-ink-2">{t("check.text")}</p>
                <div className="mt-auto pt-8">
                  <VerdictDemo items={checks} group={t("check.group")} how={t("check.how")} bare />
                </div>
              </article>
            </div>
            <div className="lg:col-span-5" data-reveal="lift">
              <article className="s1 lift flex h-full flex-col p-6 sm:p-8">
                <Icon name="i-flask" className="ico h-6 w-6 text-ink-2" />
                <h3 className="text-title mt-5">{t("bento.evidence.title")}</h3>
                <p className="mt-2 text-small text-ink-2">{t("bento.evidence.text")}</p>
                <ul className="mt-auto flex flex-col gap-2.5 pt-6">
                  {(["a", "b", "c"] as const).map((g) => (
                    <li key={g} className="flex items-center gap-3">
                      <span className="grade" aria-hidden="true">
                        {g.toUpperCase()}
                      </span>
                      <span className="text-small">
                        <span className="sr-only">{g.toUpperCase()}: </span>
                        {t(`bento.evidence.${g}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
            <div className="lg:col-span-5" data-reveal="lift">
              <article className="s1 lift flex h-full flex-col p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <Icon name="i-chart-line" className="ico h-6 w-6 text-ink-2" />
                  <span className="v-tag">{h("steps.progress.premium")}</span>
                </div>
                <h3 className="text-title mt-5">{h("steps.progress.title")}</h3>
                <p className="mt-2 text-small text-ink-2">{h("steps.progress.text")}</p>
                <div className="mt-auto grid grid-cols-2 gap-5 pt-6">
                  <div>
                    <p className="text-micro text-ink-3">{h("steps.progress.before")}</p>
                    <Readings className="mt-1" items={[{ name: concerns[0].name, value: 51 }]} of100={t("sheet.of100")} />
                  </div>
                  <div>
                    <p className="text-micro text-ink-3">{h("steps.progress.after")}</p>
                    <Readings className="mt-1" items={[{ name: concerns[0].name, value: 41 }]} of100={t("sheet.of100")} />
                  </div>
                </div>
                <p className="mt-3 text-micro text-ink-3">{h("steps.progress.example")}</p>
              </article>
            </div>
            <div className="lg:col-span-5" data-reveal="lift">
              <article className="s1 lift flex h-full flex-col p-6 sm:p-8">
                <Icon name="i-chat-teardrop-text" className="ico h-6 w-6 text-ink-2" />
                <h3 className="text-title mt-5 max-w-[22ch]">{t("bento.sarah.title")}</h3>
                <p className="mt-2 text-small text-ink-2">{d("rows.sarah.text")}</p>
                <div className="mt-auto flex items-end gap-3 pt-6">
                  <span aria-hidden="true" className="grid h-9 w-9 flex-none place-items-center rounded-full bg-shell text-micro font-medium text-on-shell">
                    S
                  </span>
                  <p className="bubble" data-typing="">
                    <span className="bubble-dots" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="bubble-text">{t("bento.sarah.say")}</span>
                  </p>
                </div>
              </article>
            </div>
            <div className="lg:col-span-7" data-reveal="lift">
              <article className="s1 lift flex h-full flex-col p-6 sm:p-8">
                <h3 className="text-headline max-w-[14ch]">
                  <HighlightPhrase text={t("trust.title")} phrase={t("highlight.trust")} isView />
                </h3>
                <p className="mt-3 max-w-[44ch] text-ink-2">{t("trust.note")}</p>
                <ul className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  {TRUST.map((it) => (
                    <li key={it.key} className="flex gap-3">
                      <Icon name={it.icon} className="ico mt-0.5 h-5 w-5 text-ink-2" />
                      <p className="text-small text-ink-2">{t(`trust.${it.key}`)}</p>
                    </li>
                  ))}
                </ul>
                <Link href="/your-data" className="link-arrow mt-auto self-start pt-7">
                  <span>{t("dataLink")}</span>
                  <Icon name="i-arrow-right" />
                </Link>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Independence: the promise reads in with the scroll, then the rules stack as cards */}
      <section aria-labelledby="ind-h" data-journey="" data-journey-size="0.96" data-journey-panel="2" data-journey-turn="">
        <div className="wrap lane-r relative py-[var(--space-section)]">
          <span className="lane-mark" data-lane="" aria-hidden="true" />
          <Split id="ind-h" text={t("independence.title")} className="text-display max-w-[19ch]" scrub />
          <div className="lane-1col mt-12 grid gap-10 md:mt-16 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-16">
            <div data-stack-aside="" className="lg:self-start">
              {/* Smooth UI scroll reveal paragraph (craftwork.design): the intro reads in word by word */}
              <ScrollRevealParagraph paragraph={t("independence.intro")} className="lede" />
              <div className="mt-6 flex flex-col items-start gap-1">
                <a href={`${APP_URL}/independence.html`} className="link-arrow">
                  <span>{t("independence.linkHow")}</span>
                  <Icon name="i-arrow-up-right" />
                </a>
                <a href={`${APP_URL}/methodology.html`} className="link-arrow">
                  <span>{t("independence.linkMethod")}</span>
                  <Icon name="i-arrow-up-right" />
                </a>
              </div>
            </div>
            <div data-stack="" className="stack">
              {RULES.map((r) => {
                const [first, rest] = lead(t(`independence.${r.key}`));
                return (
                  <article key={r.key} className="stack-card s2 flex min-h-[220px] flex-col justify-between gap-10 p-7 sm:p-9">
                    <Icon name={r.icon} className="ico h-7 w-7 text-ink-2" />
                    <div>
                      <p className="text-headline max-w-[22ch]">
                        {/* Magic UI highlighter (craftwork.design): the promise is marked as it arrives */}
                        <HighlightPhrase text={first} phrase={r.key === "i1" ? t("highlight.rule") : ""} isView />
                      </p>
                      {rest && <p className="mt-3 max-w-[52ch] text-ink-2">{rest}</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Questions not answered above */}
      <section aria-labelledby="faq-h" className="band" data-journey="" data-journey-size="0.84" data-journey-panel="3" data-journey-turn="">
        <div className="wrap lane-r lane-1col relative grid gap-12 py-[var(--space-section)] lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-20">
          <span className="lane-mark" data-lane="" aria-hidden="true" />
          <div>
            <Split id="faq-h" text={t("faq.title")} className="text-display max-w-[11ch]" />
            <p className="mt-5 text-ink-2">{t("faq.intro")}</p>
            <p className="mt-8 text-small text-ink-3">
              {t("faq.more")}{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="link">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
          <Faq items={faq} />
          <FaqJsonLd items={faq} />
        </div>
      </section>

      {/* 6. Close: the same action as the hero, on an elevated panel set on the stage */}
      <section aria-labelledby="close-h" data-journey="" data-journey-panel="0" data-journey-turn="">
        <div className="wrap py-[var(--space-section)]">
          <div className="stage" data-reveal="lift">
            {/* the plane steps in on phones so it never pokes past the viewport (same offsets as how it works) */}
            <span className="stage-plane how-close-plane" />
            {/* componentry WebGL Liquid (craftwork.design) as the living ground of the closing invite */}
            <div className="close-grid s3 relative isolate grid gap-10 overflow-hidden p-7 sm:p-10 md:p-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-end lg:gap-16">
              <WebGLLiquid className="!absolute inset-0 -z-10 h-full opacity-70" colorDeep="#d9d2ff" colorMid="#f1eeff" colorHighlight="#ffffff" speed={0.5} grain={0.02} contrast={1} opacity={1} />
              <div className="close-text">
                <Split id="close-h" text={t("close.title")} className="text-display max-w-[12ch]" />
                <p className="lede mt-5 max-w-[30rem]">{t("close.text")}</p>
              </div>
              <div className="close-form">
                <InviteForm strings={invite} stacked />
                <p className="mt-4 text-small text-ink-3">
                  {t("close.note")}{" "}
                  <Link href="/your-data" className="link">
                    {t("dataLink")}
                  </Link>
                </p>
              </div>
              {/* where the travelling phone lands (wide screens with motion only; an empty measure, never content) */}
              <span className="dock-slot" data-dock="" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Routing: retailers have their own page */}
      <section aria-labelledby="ret-h" className="band">
        <div className="wrap flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="ret-h" className="text-headline max-w-[26ch]">
              {t("retailers.title")}
            </h2>
            <p className="mt-3 max-w-[52ch] text-ink-2">{t("retailers.text")}</p>
          </div>
          <ContactReveal href="/retailers" className="flex-none">
            {t("retailers.cta")}
          </ContactReveal>
        </div>
      </section>

      {/* 8. Partners: a slow marquee, out of the hero sequence until the owner words the relationship */}
      <section aria-label={t("partnersTitle")}>
        <div className="wrap py-14">
          <LogoCloud title={t("partnersTitle")} />
        </div>
      </section>
    </>
  );
}
