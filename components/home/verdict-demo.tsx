"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-client";
import { VerdictBand } from "@/components/verdict";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

export type CheckItem = { key: string; name: string; meta: string; img: string; kind: "fits" | "caution" | "neutral"; title: string; text: string };

// The product check, as the app shows it: pick a scanned product, the verdict leads.
// motion-design "state change": the verdict settles in (opacity + 6px + 0.97 scale, 420ms), no bounce.
// bare: drop the demo's own sheet when it already sits inside an elevated card (no card in a card)
export function VerdictDemo({ items, group, how, bare }: { items: CheckItem[]; group: string; how: string; bare?: boolean }) {
  const [key, setKey] = useState(items[0].key);
  const root = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useGSAP(
    () => {
      if (first.current) {
        first.current = false;
        return;
      }
      if (prefersReducedMotion()) return;
      gsap.fromTo(".verdict-band", { opacity: 0, y: 6, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: "settle" });
    },
    { scope: root, dependencies: [key] }
  );
  const item = items.find((i) => i.key === key) ?? items[0];

  return (
    <div ref={root} className={bare ? undefined : "sheet p-4 sm:p-6"}>
      <div role="group" aria-label={group} className="grid gap-2 sm:grid-cols-3">
        {items.map((i) => (
          <button
            key={i.key}
            type="button"
            aria-pressed={key === i.key}
            onClick={() => setKey(i.key)}
            className={cn(
              "flex items-center gap-3 rounded-[var(--r-tile)] p-2.5 text-left transition-[background-color,box-shadow] duration-200 sm:flex-col sm:items-start sm:gap-2 sm:p-3",
              key === i.key ? "bg-cross-soft shadow-[inset_0_0_0_1.5px_var(--cross)]" : "shadow-[inset_0_0_0_1px_var(--rule)] hover:bg-sheet-2"
            )}
          >
            <span className="label-img h-12 w-12 flex-none">
              <Image src={i.img} alt="" width={48} height={48} />
            </span>
            <span className="min-w-0">
              <span className="block text-small font-medium leading-snug">{i.name}</span>
              <span className="block text-micro text-ink-3">{i.meta}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="mt-4" aria-live="polite">
        <VerdictBand key={item.key} kind={item.kind} title={item.title} text={item.text} />
      </div>
      <p className="mt-4 flex items-center gap-2 text-micro text-ink-3">
        <Icon name="i-barcode" className="ico h-4 w-4" />
        {how}
      </p>
    </div>
  );
}
