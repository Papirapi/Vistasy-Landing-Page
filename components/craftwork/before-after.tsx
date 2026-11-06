"use client";
// Before and after compare, from craftwork.design/components/sevenui/before-and-after-compare
// Source: sevenui by Oğuzhan Yılmaz (github.com/useui/sevenui, resizable-07 on its resizable wrapper), MIT
// licence. Same anatomy: two resizable panels in a react-resizable-panels v4 Group, each clipping the same
// full-width composition (one anchored left, one right) so nothing reflows while you drag; a labelled
// separator that is the keyboard control (arrows move it 5%, Home and End jump to the edges); a round knob
// that follows the split, clamped so it stays whole at either edge, grows while dragging and carries the
// focus ring for the separator.
// Changed for VISTASY: the compositions, labels and caption come from the caller (the pricing-card demo
// content is dropped); colours and depth are our tokens; lucide's ChevronsLeftRight is our sprite's
// i-arrows-left-right; the knob's hover, drag and keyboard-focus states live in the craftwork block of
// app/globals.css (they read the separator's data-separator state, as the original's group-has variants do).
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

// react-resizable-panels 4.17's ES build imports React.Activity by name. Next.js 15's app router bundles its own
// React, which does not export Activity, so webpack fails the production build (verified: it fails even with
// react 19.3 installed). The library's CommonJS build reads it at run time and falls back without it, so the
// panels load from there. Revisit with Next.js 16.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Group, Panel, Separator } = require("react-resizable-panels/dist/react-resizable-panels.cjs") as typeof import("react-resizable-panels");



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
  const frameRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [split, setSplit] = useState(defaultSplit);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    setWidth(frame.offsetWidth);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  // both versions render at the full frame width so each panel clips the same composition instead of
  // reflowing it
  const canvasStyle = width ? { width } : undefined;

  return (
    <figure className={cn("cw-compare flex flex-col", className)}>
      <div ref={frameRef} className={cn("relative w-full overflow-hidden", frameClassName)}>
        <Group className="flex h-full w-full" onLayoutChange={(layout) => setSplit(layout.before ?? defaultSplit)}>
          <Panel id="before" defaultSize={`${defaultSplit}%`} minSize="0%">
            <div className="relative h-full overflow-hidden">
              <div aria-hidden="true" className="absolute inset-y-0 left-0 w-full" style={canvasStyle}>
                {before}
              </div>
              <span className="v-tag absolute top-4 left-4">{beforeLabel}</span>
            </div>
          </Panel>
          <Separator
            aria-label={handleLabel}
            className="relative flex w-0.5 items-center justify-center bg-cross after:absolute after:inset-y-0 after:left-1/2 after:w-10 after:-translate-x-1/2 focus-visible:outline-none"
          />
          <Panel id="after" defaultSize={`${100 - defaultSplit}%`} minSize="0%">
            <div className="relative h-full overflow-hidden">
              <div aria-hidden="true" className="absolute inset-y-0 right-0 w-full" style={canvasStyle}>
                {after}
              </div>
              <span className="v-tag cross absolute top-4 right-4">{afterLabel}</span>
            </div>
          </Panel>
        </Group>
        <span
          aria-hidden="true"
          className="cw-compare-knob pointer-events-none absolute top-1/2 z-20 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-sheet text-ink"
          // clamp so the knob stays whole at either edge of the frame
          style={{ left: `clamp(1.125rem, ${split}%, calc(100% - 1.125rem))` }}
        >
          <Icon name="i-arrows-left-right" className="ico h-4 w-4" />
        </span>
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
