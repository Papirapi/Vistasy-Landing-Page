"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Icon } from "@/components/icon";
import { Gauge } from "@/components/kit/gauge";
import { BeforeAfter } from "@/components/craftwork/before-after";
import { CardSwipeDeck, type CardSwipeDeckHandle } from "@/components/craftwork/card-swipe-deck";
import { ContactReveal } from "@/components/craftwork/contact-reveal";
import { NumberFlow } from "@/components/craftwork/number-flow";
import { SiriOrb, useSimulatedAmplitude, type AIState } from "@/components/craftwork/siri-orb";
import { TiltCard } from "@/components/craftwork/tilt-card";
import { SPRING_PRESS } from "@/lib/craftwork/ease";
import { cn } from "@/lib/utils";

type Kind = "fits" | "caution" | "neutral";
export type CollageProduct = { key: string; img: string; name: string; meta: string; kind: Kind; title: string };
export type CollageReading = { key: string; name: string; value: number; lo: number; hi: number };
export type CollageStrings = {
  check: string; save: string; saved: string; next: string; range: string; monthly: string; yearly: string; monthPrice: string; perMonth: string; yearPrice: string; perYear: string;
  premium: string; consent: string; keep: string; del: string; ask: string; grades: string; gradeText: Record<"a" | "b" | "c", string>; gate: string[]; quality: string; again: string;
  free: string; freeLink: string; retailTitle: string; retailCta: string; faq: { q: string; a: string }[];
  // the progress compare and the product deck. Optional until the page passes them: before, after and sample
  // are HowItWorksPage.steps.progress.{before,after,example}; the rest are HomePage.hero.cards.{compare,deck,nextProduct}
  before?: string; after?: string; sample?: string; compare?: string; deck?: string; nextProduct?: string;
};
type CompareStrings = Required<Pick<CollageStrings, "before" | "after" | "sample" | "compare" | "deck" | "nextProduct">>;
const COMPARE_DEFAULTS: CompareStrings = {
  before: "First scan",
  after: "Eight weeks later",
  sample: "Sample values",
  compare: "Compare the first scan with eight weeks later",
  deck: "Sample products to check",
  nextProduct: "Next product",
};
// sample values eight weeks after the first scan, the same as the how-it-works progress stage
const PROGRESS_AFTER: Record<string, number> = { texture: 41, blemishes: 29 };

// The scallop outline (a 12-lobe flower) as an objectBoundingBox clip path, shared by the scalloped cards.
const SCALLOP = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 240; i++) {
    const t = (i / 240) * Math.PI * 2;
    const r = 0.47 + 0.028 * Math.cos(12 * t);
    pts.push(`${(0.5 + r * Math.cos(t)).toFixed(4)},${(0.5 + r * Math.sin(t)).toFixed(4)}`);
  }
  return `M${pts.join("L")}Z`;
})();

const KIND_TAG: Record<Kind, string> = { fits: "v-tag ok", caution: "v-tag flag", neutral: "v-tag" };

function Press({ children, className, ...rest }: React.ComponentProps<typeof motion.button>) {
  const reduce = useReducedMotion();
  return (
    <motion.button type="button" whileTap={reduce ? undefined : { scale: 0.94 }} transition={SPRING_PRESS} className={className} {...rest}>
      {children}
    </motion.button>
  );
}

// A scalloped product card: save it, or check it and see its verdict (the product check, in one tap).
function ProductCard({ p, s }: { p: CollageProduct; s: CollageStrings }) {
  const [saved, setSaved] = useState(false);
  const [checked, setChecked] = useState(false);
  return (
    <div className="scallop-wrap">
      <div className="scallop relative flex aspect-square flex-col items-center justify-center gap-2 p-[16%]">
        <Press aria-pressed={saved} aria-label={saved ? s.saved : s.save} onClick={() => setSaved((v) => !v)} className="absolute left-[14%] top-[16%] grid h-10 w-10 place-items-center rounded-full text-flag">
          <Icon name={saved ? "i-check-circle-fill" : "i-plus"} className={cn("ico h-5 w-5", saved ? "text-good" : "text-ink-3")} />
        </Press>
        <Image src={p.img} alt="" width={120} height={120} className="h-[46%] w-auto object-contain" />
        <span className="max-w-full truncate text-center text-micro font-medium">{p.name}</span>
        <AnimatePresence mode="wait" initial={false}>
          {checked ? (
            <motion.span key="v" className={KIND_TAG[p.kind]} initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} role="status">
              {p.title}
            </motion.span>
          ) : (
            <motion.span key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Press onClick={() => setChecked(true)} className="c-pill bg-shell text-on-shell">
                <Icon name="i-barcode" className="ico h-4 w-4" />
                {s.check}
              </Press>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// The reading card: the gauge's arc eases to the next reading while its number rolls (Smooth UI number flow).
function GaugeCard({ readings, s }: { readings: CollageReading[]; s: CollageStrings }) {
  const [i, setI] = useState(0);
  const r = readings[i];
  return (
    <TiltCard className="c-card p-5" max={8}>
      <div className="flex items-start justify-between gap-4">
        <span className="cw-gauge relative flex">
          <Gauge g={r} size={104} />
          <NumberFlow value={r.value} className="absolute inset-0 grid place-items-center font-mono text-[1.625rem] font-medium leading-none tracking-[-0.02em]" />
        </span>
        <span className="flex flex-col items-end gap-3">
          <Press onClick={() => setI((v) => (v + 1) % readings.length)} aria-label={s.next} className="c-round">
            <Icon name="i-arrow-right" className="ico" />
          </Press>
          <span className="c-dots" aria-hidden="true">
            {readings.map((x, k) => (
              <i key={x.key} style={k === i ? { background: "var(--ink)" } : { background: "var(--ink-4)" }} />
            ))}
          </span>
        </span>
      </div>
      <p className="mt-4" aria-live="polite">
        <span className="block text-title">{r.name}</span>
        <span className="block text-micro text-ink-3">{s.range.replace("{lo}", String(r.lo)).replace("{hi}", String(r.hi))}</span>
      </p>
    </TiltCard>
  );
}

// Sarah's live avatar is the Smooth UI Siri orb in our violet and lavender: it breathes at rest and, when she
// answers, swells and quickens with a simulated voice while the bubble shows its typing dots, then the reply.
const ORB_COLORS = {
  bg: "var(--lav)",
  c1: "var(--cross)",
  c2: "color-mix(in srgb, var(--cross) 45%, var(--lav))",
  // mixed toward the constant sticker ink so the orb keeps its depth on the dark theme's paler violets
  c3: "color-mix(in srgb, var(--cross) 72%, var(--sticker-ink))",
  c4: "color-mix(in srgb, var(--cross) 70%, var(--lav))",
};
const THINK_MS = 450;
const SPEAK_MS = 1700;

function SarahCard({ s }: { s: CollageStrings }) {
  const reduce = useReducedMotion();
  const [q, setQ] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const phase: AIState = speaking ? "streaming" : "idle";
  const timers = useRef<number[]>([]);
  const amplitude = useSimulatedAmplitude(phase);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const ask = (k: number) => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setQ(k);
    setTyping(false);
    if (reduce) return;
    // the orb speaks for the whole reply (its "thinking" preset turns the hue toward magenta, off our palette);
    // the bubble's typing dots carry the pause before the answer
    setTyping(true);
    setSpeaking(true);
    timers.current.push(window.setTimeout(() => setTyping(false), THINK_MS));
    timers.current.push(window.setTimeout(() => setSpeaking(false), THINK_MS + SPEAK_MS));
  };
  return (
    <div className="c-card p-5">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid h-10 w-10 place-items-center">
          <SiriOrb size="40px" state={phase} amplitude={amplitude} colors={ORB_COLORS} />
        </span>
        <span className="text-small font-medium">{s.ask}</span>
      </div>
      <div className="mt-4 flex flex-col items-start gap-2">
        {s.faq.map((f, k) => (
          <Press key={f.q} aria-pressed={q === k} onClick={() => ask(k)} className={cn("chip !min-h-[40px] text-left !text-[0.8125rem]", q === k && "!bg-cross-soft")}>
            {f.q}
          </Press>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {q !== null && (
          <motion.p key={q} className="bubble mt-3" data-typing={typing ? "on" : undefined} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} aria-live="polite">
            <span className="bubble-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="bubble-text">{s.faq[q].a}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConsentCard({ s }: { s: CollageStrings }) {
  const [del, setDel] = useState(true);
  return (
    <div className="c-card p-5">
      <p className="text-micro font-medium text-ink-3">{s.consent}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={String(del)} className="text-small font-medium" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            {del ? s.del : s.keep}
          </motion.span>
        </AnimatePresence>
        <button type="button" role="switch" aria-checked={del} aria-label={s.del} onClick={() => setDel((v) => !v)} className="c-switch" />
      </div>
    </div>
  );
}

function GateCard({ s }: { s: CollageStrings }) {
  const [run, setRun] = useState(0);
  return (
    <div className="c-card p-5">
      <ul key={run} className="flex flex-col gap-2">
        {s.gate.map((g, k) => (
          <motion.li key={g} className="flex items-center gap-2 text-small" initial={run ? { opacity: 0, x: -6 } : false} animate={{ opacity: 1, x: 0 }} transition={{ delay: k * 0.25 }}>
            <Icon name="i-check-circle-fill" className="ico h-4 w-4 text-good" />
            {g}
          </motion.li>
        ))}
      </ul>
      <Press onClick={() => setRun((v) => v + 1)} className="c-pill mt-4 bg-sheet-3 text-ink">
        <Icon name="i-arrow-clockwise" className="ico h-4 w-4" />
        {s.again}
      </Press>
    </div>
  );
}

function PriceCard({ s }: { s: CollageStrings }) {
  const [yearly, setYearly] = useState(false);
  return (
    <TiltCard className="c-card p-5" max={8}>
      <div className="flex items-center justify-between">
        <span className="v-tag">{s.premium}</span>
        <div role="group" aria-label={s.premium} className="flex rounded-full bg-sheet-3 p-1">
          {[false, true].map((y) => (
            <button key={String(y)} type="button" aria-pressed={yearly === y} onClick={() => setYearly(y)} className={cn("min-h-[32px] rounded-full px-3 text-[0.75rem] font-medium transition-colors", yearly === y ? "bg-sheet text-ink shadow-[var(--e1)]" : "text-ink-3")}>
              {y ? s.yearly : s.monthly}
            </button>
          ))}
        </div>
      </div>
      {/* the price rolls place by place (Smooth UI number flow); its hidden output reads the new price out */}
      <p className="mt-5 flex items-baseline gap-2">
        <NumberFlow value={yearly ? s.yearPrice : s.monthPrice} className="whitespace-nowrap text-[2.125rem] font-medium leading-none tracking-[-0.03em]" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={String(yearly)} className="text-small text-ink-3" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            {yearly ? s.perYear : s.perMonth}
          </motion.span>
        </AnimatePresence>
      </p>
    </TiltCard>
  );
}

// First scan against eight weeks later (sevenui before and after compare): the same two readings in both
// panels, the first scan muted, so dragging the handle shows each value and its meter move.
function CompareCard({ readings, s }: { readings: CollageReading[]; s: CompareStrings }) {
  const rows = readings.filter((r) => r.key in PROGRESS_AFTER).map((r) => ({ name: r.name, before: r.value, after: PROGRESS_AFTER[r.key] }));
  const panel = (side: "before" | "after") => (
    <div className={cn("flex h-full flex-col justify-end px-5 pb-2 pt-11", side === "before" ? "cw-compare-before bg-sheet-2 dark:bg-sheet" : "bg-sheet dark:bg-sheet-2")}>
      {rows.map((r) => (
        <div className="reading !py-2" key={r.name}>
          <span className="name !text-[0.8125rem]">{r.name}</span>
          <span className="val">{r[side]}</span>
          <span className="meter !h-1.5" style={{ "--v": r[side] / 100 } as React.CSSProperties}>
            <i />
          </span>
        </div>
      ))}
    </div>
  );
  const summary = `${s.before}: ${rows.map((r) => `${r.name} ${r.before}`).join(", ")}. ${s.after}: ${rows.map((r) => `${r.name} ${r.after}`).join(", ")}.`;
  return (
    <div className="c-card overflow-hidden">
      <BeforeAfter
        before={panel("before")}
        after={panel("after")}
        beforeLabel={s.before}
        afterLabel={s.after}
        handleLabel={s.compare}
        frameClassName="h-[156px]"
        caption={
          <span className="block px-5 pt-3 pb-4 text-micro text-ink-3">
            {s.sample}
            <span className="sr-only"> {summary}</span>
          </span>
        }
      />
    </div>
  );
}

// The product check as a deck (Smooth UI card swipe deck): drag a product away and its verdict is stamped
// on it as it goes, or press Check to stamp it in place and then move on. The last card leaves the three
// verdicts side by side.
const TONE: Record<Kind, string> = { fits: "var(--good)", caution: "var(--flag)", neutral: "var(--ink-3)" };

function ProductDeck({ products, s, label, nextLabel }: { products: CollageProduct[]; s: CollageStrings; label: string; nextLabel: string }) {
  const deck = useRef<CardSwipeDeckHandle>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [announce, setAnnounce] = useState("");
  const say = (p: CollageProduct) => setAnnounce(`${p.name}: ${p.title}`);
  const reveal = (p: CollageProduct) => {
    setChecked((c) => (c.includes(p.key) ? c : [...c, p.key]));
    say(p);
  };
  // Check gives way to the verdict and a next button: focus follows it (without scrolling the page)
  const check = (p: CollageProduct) => {
    reveal(p);
    window.requestAnimationFrame(() => wrap.current?.querySelector<HTMLButtonElement>("[data-deck-next]")?.focus({ preventScroll: true }));
  };
  const items = products.map((p) => {
    const on = checked.includes(p.key);
    return {
      id: p.key,
      tone: TONE[p.kind],
      labels: { left: p.title, right: p.title },
      revealed: on,
      content: (
        <div className="flex h-full flex-col items-center justify-center px-5 pt-6 pb-5 text-center">
          <Image src={p.img} alt="" width={120} height={120} draggable={false} className="pointer-events-none h-[88px] w-auto select-none object-contain" />
          <span className="mt-3 max-w-full truncate text-small font-medium">{p.name}</span>
          <span className="text-micro text-ink-3">{p.meta}</span>
          <span className="mt-3 flex min-h-11 items-center gap-2">
            {on ? (
              <>
                <span className={KIND_TAG[p.kind]} role="status">
                  {p.title}
                </span>
                <Press data-deck-next="" onClick={() => deck.current?.swipeRight()} aria-label={nextLabel} className="c-round !h-10 !w-10">
                  <Icon name="i-arrow-right" className="ico" />
                </Press>
              </>
            ) : (
              <Press onClick={() => check(p)} className="c-pill bg-shell text-on-shell">
                <Icon name="i-barcode" className="ico h-4 w-4" />
                {s.check}
              </Press>
            )}
          </span>
        </div>
      ),
    };
  });
  const onSwipe = (id: string) => {
    const p = products.find((x) => x.key === id);
    if (p && !checked.includes(id)) reveal(p);
    deck.current?.keepFocus();
  };
  const again = () => {
    setChecked([]);
    setAnnounce("");
    deck.current?.reset();
    deck.current?.keepFocus();
  };
  return (
    <div ref={wrap} className="pb-7">
      <CardSwipeDeck
        ref={deck}
        items={items}
        label={label}
        announce={announce}
        onSwipe={onSwipe}
        className="h-[262px] w-full"
        empty={
          <div className="flex h-full flex-col justify-center gap-3 rounded-[30px] border border-dashed border-rule px-5 py-4">
            <ul className="flex flex-col gap-2.5">
              {products.map((p) => (
                <li key={p.key} className="flex items-center gap-3">
                  <Image src={p.img} alt="" width={40} height={40} className="h-10 w-10 flex-none rounded-[10px] object-cover" />
                  <span className="flex min-w-0 flex-col items-start gap-0.5">
                    <span className="max-w-full truncate text-micro font-medium">{p.name}</span>
                    <span className={cn(KIND_TAG[p.kind], "!py-0.5")}>{p.title}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Press onClick={again} className="c-pill self-start bg-sheet-3 text-ink">
              <Icon name="i-arrow-clockwise" className="ico h-4 w-4" />
              {s.again}
            </Press>
          </div>
        }
      />
    </div>
  );
}

function EvidenceCard({ s }: { s: CollageStrings }) {
  const [g, setG] = useState<"a" | "b" | "c">("a");
  return (
    <div className="c-card p-4">
      <p className="text-micro font-medium text-ink-3">{s.grades}</p>
      <div className="mt-3 flex gap-2">
        {(["a", "b", "c"] as const).map((k) => (
          <Press key={k} aria-pressed={g === k} onClick={() => setG(k)} className={cn("grade !h-10 !w-10 !text-[0.9375rem]", g === k && "!bg-shell !text-on-shell")}>
            {k.toUpperCase()}
          </Press>
        ))}
      </div>
      <p className="mt-3 text-micro text-ink-2" aria-live="polite">
        {s.gradeText[g]}
      </p>
    </div>
  );
}

// a product shape for the decorative edge columns
function Peek({ img }: { img: string }) {
  return (
    <div className="scallop-wrap">
      <div className="scallop grid aspect-square place-items-center p-[22%]">
        <Image src={img} alt="" width={120} height={120} className="h-auto w-[70%] object-contain" />
      </div>
    </div>
  );
}

function FreeBadge({ s }: { s: CollageStrings }) {
  return (
    <div className="scallop-wrap">
      <div className="scallop badge-lav flex aspect-square flex-col items-center justify-center gap-3 p-[18%] text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-shell text-on-shell" aria-hidden="true">
          <Icon name="i-scan-smiley-fill" className="ico h-6 w-6" />
        </span>
        <span className="text-title leading-tight">{s.free}</span>
        <ContactReveal href="/pricing">{s.freeLink}</ContactReveal>
      </div>
    </div>
  );
}

function RetailCard({ s }: { s: CollageStrings }) {
  return (
    <div className="c-card p-5">
      <p className="text-small font-medium">{s.retailTitle}</p>
      <ContactReveal href="/contact#retailers" className="mt-4">
        {s.retailCta}
      </ContactReveal>
    </div>
  );
}

// The hero, after the reference the owner chose: the app on a phone in the middle, interactive cards around
// it, columns bleeding off both edges. Every card is elevated and anchored; every card does something.
export function HeroCollage({ copy, phone, products, readings, s }: { copy: ReactNode; phone: ReactNode; products: CollageProduct[]; readings: CollageReading[]; s: CollageStrings }) {
  const cs: CompareStrings = {
    before: s.before ?? COMPARE_DEFAULTS.before,
    after: s.after ?? COMPARE_DEFAULTS.after,
    sample: s.sample ?? COMPARE_DEFAULTS.sample,
    compare: s.compare ?? COMPARE_DEFAULTS.compare,
    deck: s.deck ?? COMPARE_DEFAULTS.deck,
    nextProduct: s.nextProduct ?? COMPARE_DEFAULTS.nextProduct,
  };
  return (
    <div className="collage">
      <svg width="0" height="0" aria-hidden="true" className="absolute">
        <clipPath id="vis-scallop" clipPathUnits="objectBoundingBox">
          <path d={SCALLOP} />
        </clipPath>
      </svg>
      <div className="collage-grid">
        {/* decorative peeks, after the reference: product shapes cut by the viewport edge; no controls in them */}
        <div className="collage-peek collage-peek-l" aria-hidden="true" data-collage-col="">
          <Peek img={products[0].img} />
          <Peek img={products[2].img} />
        </div>
        <div className="collage-peek collage-peek-r" aria-hidden="true" data-collage-col="">
          <Peek img={products[1].img} />
          <Peek img={products[0].img} />
        </div>
        <div className="collage-col" data-collage-col="">
          {copy}
          <div className="hidden grid-cols-2 gap-[18px] lg:grid">
            <ConsentCard s={s} />
            <GateCard s={s} />
          </div>
          <div className="hidden lg:block">
            <CompareCard readings={readings} s={cs} />
          </div>
        </div>
        <div className="follow-phone mx-auto w-full max-w-[360px] lg:max-w-none" data-follow-phone="">
          <div data-follow-inner="">{phone}</div>
        </div>
        {/* above the next column, so a product card thrown from the deck passes over it */}
        <div className="collage-col collage-row lg:z-[2] lg:pt-[56px]" data-collage-col="">
          <GaugeCard readings={readings} s={s} />
          <SarahCard s={s} />
          {/* the product check as a deck of the three sample products, in place of a scalloped product card */}
          <ProductDeck products={products} s={s} label={cs.deck} nextLabel={cs.nextProduct} />
          {/* on phones the progress compare joins this swipeable row; wide screens show it under the copy */}
          <div className="lg:hidden">
            <CompareCard readings={readings} s={cs} />
          </div>
        </div>
        <div className="collage-col collage-row collage-c lg:pt-[20px]" data-collage-col="">
          {/* on phones the consent and quality-gate cards join this swipeable row, after the phone */}
          <div className="lg:hidden">
            <ConsentCard s={s} />
          </div>
          <div className="lg:hidden">
            <GateCard s={s} />
          </div>
          <FreeBadge s={s} />
          <PriceCard s={s} />
          <ProductCard p={products[2]} s={s} />
          <RetailCard s={s} />
          <EvidenceCard s={s} />
        </div>
      </div>
    </div>
  );
}
