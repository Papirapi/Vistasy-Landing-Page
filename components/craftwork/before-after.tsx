"use client";
// Before and after compare, after craftwork.design/components/sevenui/before-and-after-compare
// Source: sevenui by Oğuzhan Yılmaz (github.com/useui/sevenui, resizable-07), MIT licence. Same anatomy: two
// copies of one full-width composition, the "before" clipped at the split so nothing reflows while you drag;
// labels in the corners; a round knob that follows the split, clamped so it stays whole at either edge.
// Changed for VISTASY: the split is a native <input type="range"> laid invisibly over the frame instead of the
// react-resizable-panels Group (107 kB of script on the home page's critical path for one slider, and a
// CommonJS require to dodge a React.Activity import). The range gives the same pointer drag, click-to-jump,
// arrow keys, Home and End, and a value for assistive tech, for nothing. Knob states live in app/globals.css.
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

export function BeforeAfter({
  before,
  after,
  beforeLabel,
  afterLabel,
  handleLabel,
  caption,
  className,
  frameClassName,
  defaultSplit = 50,
}: {
  before: ReactNode;
  after: ReactNode;
  beforeLabel: string;
  afterLabel: string;
  handleLabel: string;
  caption?: ReactNode;
  className?: string;
  frameClassName?: string;
  defaultSplit?: number;
}) {
  const [split, setSplit] = useState(defaultSplit);
  const at = `${split}%`;

  return (
    <figure className={cn("cw-compare flex flex-col", className)}>
      <div className={cn("relative w-full overflow-hidden select-none", frameClassName)}>
        {/* after: the full composition underneath */}
        <div aria-hidden="true" className="absolute inset-0">
          {after}
          <span className="v-tag cross absolute top-4 right-4">{afterLabel}</span>
        </div>
        {/* before: the same composition, clipped at the split */}
        <div aria-hidden="true" className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
          {before}
          <span className="v-tag absolute top-4 left-4">{beforeLabel}</span>
        </div>
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-cross" style={{ left: at }} />
        <input
          type="range"
          className="cw-compare-range z-20"
          min={0}
          max={100}
          step={1}
          value={split}
          aria-label={handleLabel}
          aria-valuetext={`${beforeLabel} ${split}%`}
          onChange={(e) => setSplit(Number(e.target.value))}
        />
        <span
          aria-hidden="true"
          className="cw-compare-knob pointer-events-none absolute top-1/2 z-30 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-sheet text-ink"
          // clamp so the knob stays whole at either edge of the frame
          style={{ left: `clamp(1.125rem, ${at}, calc(100% - 1.125rem))` }}
        >
          <Icon name="i-arrows-left-right" className="ico h-4 w-4" />
        </span>
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
