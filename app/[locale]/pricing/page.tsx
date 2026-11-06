import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/meta";
import { Split } from "@/components/split";
import { Pricing, type Amount, type Billing, type Plan } from "@/components/pricing/pricing";
import { Faq } from "@/components/faq";
import { FaqJsonLd } from "@/components/seo/json-ld";
import { inviteStrings } from "@/lib/invite-strings";

// Page motion on the kit's tokens (the kit is app/globals.css; this only stages it). It ships inside the
// page (React hoists it into <head>) rather than as an imported stylesheet: a route stylesheet is preloaded
// by every link to this page and Chrome then warns on every page that it went unused.
// The plans are set down after the headline lands, in CSS from the first paint, so the prices never wait
// for JavaScript; opacity and transform only. A panel restarts its animation each time it is shown, so a
// tab switch sets the new plans down too, quicker once the reader has switched. Reduced motion: none.
// Everything the reader can press has settled within about a second of the first paint.
const MOTION = `@media (prefers-reduced-motion: no-preference) {
  .pr-intro { animation: pr-fade 0.6s var(--ease-out) 0.2s both; }
  .pr-in { animation: pr-set 0.75s var(--ease-out) both; animation-delay: calc(0.25s + var(--d, 0) * 70ms); }
  [data-switched] .pr-in { animation-duration: 0.6s; animation-delay: calc(var(--d, 0) * 60ms); }
}
@keyframes pr-fade { from { opacity: 0; transform: translateY(14px); } }
@keyframes pr-set { from { opacity: 0; transform: translateY(30px) scale(0.97); } }`;

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  return pageMeta(locale, "pricing", "/pricing");
}

// A price from the copy ("4.99 €", "4,99 €", "290 €") as the number the ticker counts up to and the unit
// written after it (after a space, non-breaking in French). Anything else ("On request", or a figure with a
// thousands separator) stays text, so the ticker can never show a different number from the copy.
function amount(price: string): Amount | undefined {
  const m = price.match(/^(\d+)(?:[.,](\d{1,2}))?(\s.*)$/);
  if (!m) return undefined;
  return { value: Number(`${m[1]}.${m[2] ?? "0"}`), decimals: m[2]?.length ?? 0, unit: m[3] };
}

const PILOT_TERMS = ["weeks", "fee", "ab", "study"] as const;

export default async function PricingPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("PricingPage");
  const home = await getTranslations("HomePage");
  const items = (base: string, keys: string[]) => keys.map((k) => t(`${base}.${k}`));
  const faq = (keys: string[]) => keys.map((k) => ({ q: t(`faq.items.${k}.q`), a: t(`faq.items.${k}.a`) }));
  const priced = (plan: Omit<Plan, "amount">): Plan => ({ ...plan, amount: amount(plan.price) });

  const free = priced({ key: "free", name: t("people.free.name"), text: t("people.free.text"), price: t("people.free.price"), items: items("people.free", ["i1", "i2", "i3", "i4"]) });
  const premium = priced({
    key: "premium",
    name: t("people.premium.name"),
    text: t("people.premium.text"),
    price: t("people.premium.priceMonthly"),
    per: t("perMonth"),
    hint: t("monthlyHint"),
    items: items("people.premium", ["i1", "i2", "i3", "i4"]),
  });
  // Premium's billing cycle (components/craftwork/billing-cycle.tsx): the cycle names, the yearly price and its
  // unit are the home hero's price card copy, so both places say the same thing
  const billing: Billing = {
    s: { label: t("billing.label"), monthly: home("hero.cards.monthly"), yearly: home("hero.cards.yearly"), save: t("billing.save") },
    yearly: { price: home("hero.cards.yearPrice"), per: home("hero.cards.perYear"), hint: t("yearlyHint") },
  };
  const retail: Plan[] = [
    priced({ key: "starter", name: t("retailers.starter.name"), text: t("retailers.starter.scans"), price: t("retailers.starter.price"), per: t("perMonth"), items: items("retailers.starter", ["i1", "i2", "i3"]) }),
    priced({ key: "growth", name: t("retailers.growth.name"), text: t("retailers.growth.scans"), price: t("retailers.growth.price"), per: t("perMonth"), items: items("retailers.growth", ["i1", "i2", "i3", "i4"]) }),
    priced({ key: "enterprise", name: t("retailers.enterprise.name"), text: t("retailers.enterprise.scans"), price: t("retailers.enterprise.price"), items: items("retailers.enterprise", ["i1", "i2", "i3", "i4"]) }),
  ];

  return (
    <section aria-labelledby="pricing-h">
      <style href="vistasy-pricing-motion" precedence="default">
        {MOTION}
      </style>
      <div className="wrap pt-10 pb-[var(--space-section)] md:pt-16">
        {/* the headline rises and the lede fades up in CSS from the first paint (the kit's intro) */}
        <div data-intro="">
          <Split id="pricing-h" as="h1" intro text={t("title")} className="text-hero max-w-[14ch]" />
          <p className="lede mt-6 max-w-[36rem]" data-hero-fade="">
            {t("lede")}
          </p>
        </div>
        <Pricing
          className="mt-10 md:mt-12"
          locale={locale}
          tabs={{ label: t("tabs.label"), people: t("tabs.people"), retailers: t("tabs.retailers") }}
          people={{ free, premium, billing, inviteTitle: t("people.inviteTitle"), inviteText: t("people.inviteText"), invite: await inviteStrings(), note: t("people.note"), dataLink: home("dataLink") }}
          retailers={{
            plans: retail,
            pilot: { title: t("retailers.pilotTitle"), terms: PILOT_TERMS.map((k) => ({ key: k, text: t(`retailers.pilotTerms.${k}`) })) },
            cta: t("retailers.cta"),
          }}
          faq={{ title: t("faq.title"), people: <Faq items={faq(["q1", "q2"])} />, retailers: <Faq items={faq(["q3", "q4"])} /> }}
        />
        <FaqJsonLd items={faq(["q1", "q2", "q3", "q4"])} />
      </div>
    </section>
  );
}
