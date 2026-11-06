"use client";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icon";
import { Split } from "@/components/split";
import { Ticker } from "@/components/kit/ticker";
import { InviteForm, type InviteStrings } from "@/components/invite-form";
import { BillingCycle, type BillingCycleStrings, type Cycle } from "@/components/craftwork/billing-cycle";
import { useHashTabs } from "@/lib/use-hash-tabs";
import { useTabIndicator } from "@/lib/use-tab-indicator";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-client";

/** a price the ticker can count up to: 4.99 with 2 decimals, then the unit as written (" €") */
export type Amount = { value: number; decimals: number; unit: string };
export type Plan = { key: string; name: string; text: string; price: string; amount?: Amount; per?: string; hint?: string; items: string[] };
/** the yearly side of a plan with a billing cycle: its price, unit and hint as written in the copy */
export type Billing = { s: BillingCycleStrings; yearly: { price: string; per: string; hint: string } };
type Props = {
  locale: string;
  className?: string;
  tabs: { label: string; people: string; retailers: string };
  people: { free: Plan; premium: Plan; billing: Billing; inviteTitle: string; inviteText: string; invite: InviteStrings; note: string; dataLink: string };
  retailers: { plans: Plan[]; pilot: { title: string; terms: { key: string; text: string }[] }; cta: string };
  /** each audience's questions, rendered on the server and shown inside its own tab (critique round 3) */
  faq: { title: string; people: ReactNode; retailers: ReactNode };
};

const AUDIENCES = ["people", "retailers"] as const;
const TERM_ICONS: Record<string, string> = { weeks: "i-timer", fee: "i-wallet", ab: "i-arrows-left-right", study: "i-file-text" };

// Audience first, then price: one tab per audience, linkable as #people or #retailers (the nav swaps
// its call to action with the hash). The one paid consumer plan carries its own billing cycle (sevenui's
// billing-cycle pricing, components/craftwork/billing-cycle.tsx): monthly by default, with the yearly
// price as its hint, and Yearly swaps the price in place. Each panel ends with its own next step, staged as
// the panel's anchor: the plans rest on the page (s1), the action stands on a stage above them (s3).
export function Pricing({ locale, className, tabs, people, retailers, faq }: Props) {
  const { selected, listProps, tabProps, panelProps } = useHashTabs(AUDIENCES);
  const { list, indicator, ready } = useTabIndicator<HTMLDivElement>(selected);
  const root = useRef<HTMLDivElement>(null);
  // once the reader has switched tabs, an arriving panel is set down quicker than at first paint (the
  // motion styles live with the page, app/[locale]/pricing/page.tsx)
  const [switched, setSwitched] = useState(false);
  const onSwitch = () => setSwitched(true);

  // Prices count up while their cards are being set down (Magic UI number-ticker anatomy, via <Ticker>).
  // Only a number on screen whose card is still arriving counts: a number the reader has already seen
  // stays put (a slow script never makes it jump back to zero), and one below the fold is left to the
  // scroll preset in lib/motion.ts, which counts it when it arrives. Reduced motion: the final prices.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const panel = root.current?.querySelector<HTMLElement>('[role="tabpanel"]:not([hidden])');
      if (!panel) return;
      const vh = window.innerHeight;
      const lang = document.documentElement.lang || "en";
      panel.querySelectorAll<HTMLElement>("[data-ticker]").forEach((el, i) => {
        const end = Number(el.dataset.ticker);
        const dec = Number(el.dataset.decimals ?? 0);
        const final = el.nextElementSibling?.textContent ?? "";
        const top = el.getBoundingClientRect().top;
        const card = el.closest<HTMLElement>(".pr-in");
        if (!end || el.textContent !== final || top < 0 || top > vh * 0.92) return;
        if (card && parseFloat(getComputedStyle(card).opacity) > 0.35) return;
        const fmt = new Intl.NumberFormat(lang, { minimumFractionDigits: dec, maximumFractionDigits: dec });
        const o = { v: 0 };
        el.textContent = fmt.format(0);
        gsap.to(o, {
          v: end,
          duration: 1.2,
          delay: 0.12 + i * 0.08,
          ease: "power2.out",
          onUpdate: () => void (el.textContent = fmt.format(o.v)),
          onComplete: () => void (el.textContent = final),
        });
      });
    },
    { scope: root, dependencies: [selected] }
  );

  return (
    <div ref={root} className={className} data-switched={switched ? "" : undefined}>
      <div className="pr-intro">
        <div
          {...listProps(tabs.label)}
          ref={list}
          data-ind={indicator ? (ready ? "ready" : "init") : undefined}
          className="seg"
          onClickCapture={onSwitch}
          onKeyDownCapture={onSwitch}
        >
          <span aria-hidden="true" className="seg-ind" style={indicator ?? undefined} />
          {AUDIENCES.map((audience) => (
            <button key={audience} {...tabProps(audience)}>
              {tabs[audience]}
            </button>
          ))}
        </div>
      </div>

      <div {...panelProps("people")} className="mt-10 md:mt-12">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          <Arrive d={0}>
            <PlanCard plan={people.free} locale={locale} reserveHint reserveCycle />
          </Arrive>
          <Arrive d={1}>
            <PlanCard plan={people.premium} locale={locale} reserveHint billing={people.billing} />
          </Arrive>
          <Arrive d={2} className="md:col-span-2 lg:col-span-1">
            <Anchor>
              <div className="flex h-full flex-col p-6 sm:p-7">
                <h2 className="text-title">{people.inviteTitle}</h2>
                <p className="mt-1 mb-6 text-small text-ink-2">{people.inviteText}</p>
                <InviteForm strings={people.invite} stacked />
                <p className="mt-4 text-micro text-ink-3">
                  {people.note}{" "}
                  <Link href="/your-data" className="link">
                    {people.dataLink}
                  </Link>
                </p>
              </div>
            </Anchor>
          </Arrive>
        </div>
        <Questions title={faq.title}>{faq.people}</Questions>
      </div>

      <div {...panelProps("retailers")} className="mt-10 md:mt-12">
        <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
          {retailers.plans.map((p, i) => (
            <Arrive key={p.key} d={i}>
              <PlanCard plan={p} locale={locale} />
            </Arrive>
          ))}
        </div>
        <Arrive d={3} className="mt-12 md:mt-14">
          <Anchor>
            <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
              <div>
                <Icon name="i-seal-check" className="ico h-7 w-7 text-ink-2" />
                <h2 className="text-headline mt-4 max-w-[24ch]">{retailers.pilot.title}</h2>
                <ul className="mt-7 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                  {retailers.pilot.terms.map((term) => (
                    <li key={term.key} className="flex items-start gap-3">
                      <Icon name={TERM_ICONS[term.key] ?? "i-check"} className="ico mt-0.5 h-5 w-5 text-ink-3" />
                      <span>{term.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/contact#retailers" className="btn btn-primary btn-lg self-start lg:self-end">
                {retailers.cta}
              </Link>
            </div>
          </Anchor>
        </Arrive>
        <Questions title={faq.title}>{faq.retailers}</Questions>
      </div>
    </div>
  );
}

// A card's way onto the page, in three layers so no two motions fight over one transform: the scroll
// preset sets the outer wrapper down when it arrives below the fold (data-reveal="lift"), the page's motion
// styles set the inner one down at first paint and whenever its panel is shown, and the card keeps its hover.
function Arrive({ d, className, children }: { d: number; className?: string; children: ReactNode }) {
  return (
    <div data-reveal="lift" className={className}>
      <div className="pr-in h-full" style={{ "--d": d } as CSSProperties}>
        {children}
      </div>
    </div>
  );
}

// The tab's next step stands on the stage (the kit's visual anchoring): a tinted plane offset behind it,
// a contact shadow that stays on the page, and the panel one elevation above the plans around it.
function Anchor({ children }: { children: ReactNode }) {
  return (
    <div className="stage h-full">
      <span aria-hidden="true" className="stage-plane inset-[14px_-10px_-14px_10px] sm:inset-[18px_-18px_-18px_18px]" />
      <span aria-hidden="true" className="contact-shadow" style={{ bottom: "-30px" }} />
      <div className="s3 h-full">{children}</div>
    </div>
  );
}

function Questions({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-20 grid gap-8 md:mt-28 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-20">
      <Split text={title} className="text-headline max-w-[14ch]" />
      <div data-reveal="">{children}</div>
    </div>
  );
}

// Plan anatomy after Smooth UI's pricing-2 (MIT): name and promise, the price with its unit, a hint line
// (reserved where a neighbour has one, so the dividers line up across a row), then what is included.
// No tier is highlighted. A plan with a billing cycle shows sevenui's switch above its price, and the price,
// unit and hint change in place in a polite live region (its neighbour reserves the switch's height from
// md up, so the prices still line up). The price is keyed by the cycle, so a count still running from the
// first paint can never write the old price over the new one.
function PlanCard({ plan, locale, reserveHint, reserveCycle, billing }: { plan: Plan; locale: string; reserveHint?: boolean; reserveCycle?: boolean; billing?: Billing }) {
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [changed, setChanged] = useState(false);
  const yearly = billing && cycle === "yearly" ? billing.yearly : null;
  const per = yearly ? yearly.per : plan.per;
  const hint = yearly ? yearly.hint : plan.hint;
  return (
    <article className="s1 lift flex h-full flex-col p-6 sm:p-7">
      <h2 className="text-title">{plan.name}</h2>
      <p className="mt-1 text-small text-ink-3 md:min-h-[3em]">{plan.text}</p>
      {billing ? (
        <BillingCycle
          className="mt-5"
          value={cycle}
          s={billing.s}
          onChange={(c) => {
            setCycle(c);
            setChanged(true);
          }}
        />
      ) : (
        reserveCycle && <div aria-hidden="true" className="mt-5 hidden h-10 md:block" />
      )}
      <div aria-live={billing ? "polite" : undefined} aria-atomic={billing ? true : undefined}>
        <p className="mt-6 flex min-h-[1.04em] flex-wrap content-end items-baseline gap-x-2 text-display">
          {yearly ? (
            <span key="yearly" className={`tnum font-medium tracking-[-0.035em] whitespace-nowrap ${changed ? "pr-swap" : ""}`}>
              {yearly.price}
            </span>
          ) : plan.amount ? (
            <span key="monthly" className={`font-medium tracking-[-0.035em] whitespace-nowrap ${changed ? "pr-swap" : ""}`}>
              <Ticker value={plan.amount.value} decimals={plan.amount.decimals} locale={locale} />
              {plan.amount.unit}
            </span>
          ) : (
            <span className="text-headline font-medium">{plan.price}</span>
          )}
          {per && (
            <span key={`per-${cycle}`} className={`text-small tracking-normal text-ink-3 ${changed ? "pr-swap" : ""}`}>
              {per}
            </span>
          )}
        </p>
        {/* plain classes on purpose: tailwind-merge reads text-small as a colour and would drop it for text-ink-3 */}
        {(hint || reserveHint) && <p className={`mt-2 text-small text-ink-3 md:min-h-[3em] ${hint ? "" : "max-md:hidden"}`}>{hint}</p>}
      </div>
      <ul className="mt-6 flex flex-col gap-3 border-t border-rule-2 pt-6 text-small text-ink">
        {plan.items.map((i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Icon name="i-check" className="ico mt-1 h-4 w-4 text-ink-3" />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
