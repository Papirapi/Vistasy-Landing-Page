"use client";
// Number flow, from craftwork.design/components/smooth-ui/number-flow
// Source: Smooth UI by Eduardo Calvo (github.com/educlopez/smoothui), MIT licence. Same anatomy and motion:
// every digit place is a clipped slot holding the previous and the next digit; a place that changes rolls
// both with the Web Animations API (300ms, cubic-bezier(0.22, 1, 0.36, 1)), up when the value grows and
// down when it shrinks, and the value is read out once from a visually hidden output.
// Changed for VISTASY: controlled only (the +/- stepper and SmoothButton are dropped; the card owns the
// value), any number of integer places plus a decimal part and a prefix or suffix, so a formatted price
// such as "4.99 €" rolls place by place to "39 €"; the digits take the surrounding type instead of the
// boxed tiles; reduced motion comes from motion's useReducedMotion.
import { useReducedMotion } from "motion/react";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const OPTIONS = { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };

const animateDigit = (previous: HTMLElement | null, next: HTMLElement | null, increasing: boolean): Animation[] => {
  if (!(previous?.animate && next?.animate)) return [];
  return [
    previous.animate(
      [
        { opacity: 1, transform: "translateY(0%)" },
        { opacity: 0, transform: `translateY(${increasing ? -100 : 100}%)` },
      ],
      OPTIONS
    ),
    next.animate(
      [
        { opacity: 0, transform: `translateY(${increasing ? 100 : -100}%)` },
        { opacity: 1, transform: "translateY(0%)" },
      ],
      OPTIONS
    ),
  ];
};

type Parts = { prefix: string; int: string; sep: string; frac: string; suffix: string; n: number };

// "4,99 €" -> { int: "4", sep: ",", frac: "99", suffix: " €" }; a value with no digits keeps its text as-is
function parse(v: number | string): Parts {
  const text = String(v);
  const m = text.match(/^(\D*?)(\d+)(?:([.,])(\d+))?(\D*)$/);
  if (!m) return { prefix: text, int: "", sep: "", frac: "", suffix: "", n: 0 };
  const [, prefix, int, sep = "", frac = "", suffix] = m;
  return { prefix, int, sep, frac, suffix, n: Number(`${int}.${frac || 0}`) };
}

type Slot = { key: string; prev: string; next: string };

// integer places line up from the ones place, decimals from the separator (the original's place values)
function slots(a: Parts, b: Parts): Slot[] {
  const out: Slot[] = [];
  const ni = Math.max(a.int.length, b.int.length);
  for (let i = ni - 1; i >= 0; i--) out.push({ key: `i${i}`, prev: a.int[a.int.length - 1 - i] ?? "", next: b.int[b.int.length - 1 - i] ?? "" });
  const nf = Math.max(a.frac.length, b.frac.length);
  for (let i = 0; i < nf; i++) out.push({ key: `f${i}`, prev: a.frac[i] ?? "", next: b.frac[i] ?? "" });
  return out;
}

export interface NumberFlowProps {
  value: number | string;
  className?: string;
  digitClassName?: string;
}

export function NumberFlow({ value, className, digitClassName }: NumberFlowProps) {
  const reduced = useReducedMotion();
  const root = useRef<HTMLSpanElement>(null);
  // the previous value, kept beside the current one so each slot can hold both (derived during render)
  const [pair, setPair] = useState({ prev: value, cur: value });
  if (pair.cur !== value) setPair({ prev: pair.cur, cur: value });

  const a = parse(pair.prev);
  const b = parse(pair.cur);
  const list = slots(a, b);
  const fracStart = list.findIndex((s) => s.key === "f0");

  useIsoLayoutEffect(() => {
    if (pair.prev === pair.cur || reduced || !root.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const increasing = parse(pair.cur).n > parse(pair.prev).n;
    const animations: Animation[] = [];
    root.current.querySelectorAll<HTMLElement>("[data-flow-changed]").forEach((slot) => {
      animations.push(...animateDigit(slot.querySelector<HTMLElement>("[data-flow-prev]"), slot.querySelector<HTMLElement>("[data-flow-next]"), increasing));
    });
    return () => animations.forEach((x) => x.cancel());
  }, [pair, reduced]);

  return (
    // plain inline flow (not flex), so the spaces in a prefix or suffix such as " €" survive
    <span ref={root} className={className}>
      <output className="sr-only">{String(value)}</output>
      <span aria-hidden="true" className={cn("tabular-nums", digitClassName)}>
        {b.prefix}
        {list.map((s, k) => (
          <Fragment key={s.key}>
            {k === fracStart && b.sep ? b.sep : null}
            {s.next ? (
              <span className="relative inline-block [clip-path:inset(0)]" data-flow-changed={s.prev !== s.next && pair.prev !== pair.cur ? "" : undefined}>
                <span data-flow-prev="" className="absolute inset-0 text-center" style={{ transform: "translateY(-100%)" }}>
                  {s.prev}
                </span>
                <span data-flow-next="" className="inline-block" style={{ transform: "translateY(0%)" }}>
                  {s.next}
                </span>
              </span>
            ) : null}
          </Fragment>
        ))}
        {b.suffix}
      </span>
    </span>
  );
}
