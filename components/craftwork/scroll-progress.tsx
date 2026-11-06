"use client";
// Scroll progress, from craftwork.design/components/smooth-ui/scroll-progress
// Source: Smooth UI by Eduardo Calvo (github.com/educlopez/smoothui), MIT licence. Same anatomy and motion: a
// spring-smoothed reading of the page's native scroll (motion's useScroll, which ScrollSmoother keeps intact),
// drawn as a bar whose fill slides in with a brightened leading edge, or as a ring, a number or segments.
// Changed: imports (`cn`, motion/react), colours to the site tokens (track ink at 12%, fill the violet
// measurement accent, muted figures ink-3), and a `decorative` prop: the site-wide bar is ornament, so it is
// hidden from assistive tech and skips the per-percent re-render the progressbar role needs.
import {
  type MotionValue,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { type CSSProperties, type RefObject, useState } from "react";
import { cn } from "@/lib/utils";

const SPRING_CONFIG = { damping: 30, mass: 0.4, stiffness: 220 } as const;
const SEGMENT_SPRING = { bounce: 0.1, duration: 0.25 } as const;
const DEFAULT_RING_SIZE_PX = 56;
const DEFAULT_SEGMENTS = 8;
const SEGMENT_WIDTH_PX = 18;
const PERCENT_MULTIPLIER = 100;
const MIN_PERCENT = 0;
const MAX_PERCENT = 100;
const DEFAULT_THICKNESS = 4;
const TRACK_MIN_THICKNESS = 2;
/** Width of the brightened leading edge baked into the bar's own gradient. */
const LEADING_EDGE_STOP = "2.25rem";
/** Ring label font size as a fraction of the ring diameter. */
const RING_LABEL_SIZE_RATIO = 0.28;
/** Digits carry no descender, so a numeral centred on a ring reads a hair low: lift it by a fraction of an em. */
const NUMERAL_OPTICAL_LIFT = "-0.028em";

export type ScrollProgressVariant = "bar" | "ring" | "number" | "segments";
export type ScrollProgressPosition = "top" | "bottom" | "fixed-corner" | "inline";

export interface ScrollProgressProps {
  className?: string;
  color?: string;
  /** Ref to a scrollable ancestor whose own scroll is measured instead of the window. */
  container?: RefObject<HTMLElement | null>;
  /**
   * Uses `position: sticky` (not `fixed`) so the indicator stays inside its scrollable ancestor.
   * `inline` opts out of stickiness: use it when you place the indicator in your own bar.
   */
  position?: ScrollProgressPosition;
  /** Number of segments for the "segments" variant. */
  segments?: number;
  showLabel?: boolean;
  /** Diameter (px) of the "ring" variant. */
  size?: number;
  /** Spring-smooth the value. Ignored (always direct) when reduced motion is preferred. */
  smooth?: boolean;
  /** Bar height, ring/segment stroke width, in pixels. */
  thickness?: number;
  variant?: ScrollProgressVariant;
  /** Ornament only: hidden from assistive tech, no progressbar role (VISTASY addition). */
  decorative?: boolean;
}

const POSITION_CLASSES: Record<ScrollProgressPosition, string> = {
  bottom: "sticky inset-x-0 bottom-0 z-40",
  "fixed-corner": "sticky inset-x-0 bottom-4 z-40 flex justify-end pr-4",
  inline: "relative",
  top: "sticky inset-x-0 top-0 z-40",
};

const clampPercent = (value: number) => Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, value));

const clampUnit = (value: number) => Math.min(1, Math.max(0, value));

interface PercentFigureProps {
  className?: string;
  /** Applied to the digits only, so the unit can stay muted beside them. */
  digitColor?: string;
  percent: number;
  style?: CSSProperties;
}

/** Digits and `%` as one typographic unit: shared baseline, tabular figures, the unit a fraction of the figure. */
const PercentFigure = ({ percent, digitColor, className, style }: PercentFigureProps) => (
  <span className={cn("inline-flex items-baseline font-semibold leading-none tracking-tight", className)} style={style}>
    <span className="tabular-nums" style={digitColor ? { color: digitColor } : undefined}>
      {percent}
    </span>
    <span className="ml-[0.06em] text-[0.56em] font-medium leading-none text-ink-3">%</span>
  </span>
);

interface SegmentDashProps {
  color: string;
  index: number;
  segments: number;
  thickness: number;
  value: MotionValue<number>;
}

const SegmentDash = ({ value, index, segments, thickness, color }: SegmentDashProps) => {
  const shouldReduceMotion = useReducedMotion();
  // Each pill owns one 1/segments slice of the range, so they fill strictly one after another.
  const fill = useTransform(value, (progress) => clampUnit(progress * segments - index));
  const springFill = useSpring(fill, SEGMENT_SPRING);

  return (
    <span className="relative block shrink-0 overflow-hidden rounded-full bg-ink/12" style={{ height: thickness, width: SEGMENT_WIDTH_PX }}>
      <motion.span
        className="absolute inset-0 origin-left rounded-full"
        style={{ backgroundColor: color, scaleX: shouldReduceMotion ? fill : springFill }}
      />
    </span>
  );
};

export default function ScrollProgress({
  variant = "bar",
  position = "top",
  container,
  thickness = DEFAULT_THICKNESS,
  color = "var(--cross)",
  showLabel = false,
  segments = DEFAULT_SEGMENTS,
  size = DEFAULT_RING_SIZE_PX,
  smooth = true,
  decorative = false,
  className,
}: ScrollProgressProps) {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ container });
  const springValue = useSpring(scrollYProgress, SPRING_CONFIG);
  const value = shouldReduceMotion || !smooth ? scrollYProgress : springValue;

  const [percent, setPercent] = useState(0);
  useMotionValueEvent(value, "change", (latest) => {
    // the figure only exists for the progressbar role and the labels; an ornament never re-renders for it
    if (decorative && variant === "bar") return;
    setPercent(Math.round(clampPercent(latest * PERCENT_MULTIPLIER)));
  });

  // The fill is full-width and slides in from the left instead of being scaled: a translate leaves the
  // gradient and the rounded cap undistorted, so the leading edge is literally the end of the bar.
  const fillX = useTransform(value, (latest) => `${-PERCENT_MULTIPLIER * (1 - clampUnit(latest))}%`);

  const ariaProps = decorative
    ? ({ "aria-hidden": true } as const)
    : ({
        "aria-label": "Reading progress",
        "aria-valuemax": MAX_PERCENT,
        "aria-valuemin": MIN_PERCENT,
        "aria-valuenow": percent,
        role: "progressbar",
      } as const);

  if (variant === "bar") {
    return (
      <div {...ariaProps} className={cn(POSITION_CLASSES[position], "w-full", className)}>
        <div className="w-full overflow-hidden rounded-full bg-ink/12" style={{ height: Math.max(thickness, TRACK_MIN_THICKNESS) }}>
          <motion.div
            className="h-full w-full rounded-full"
            style={{
              backgroundImage: `linear-gradient(90deg, ${color} 0%, ${color} calc(100% - ${LEADING_EDGE_STOP}), color-mix(in oklab, ${color} 40%, white) 100%)`,
              x: fillX,
            }}
          />
        </div>
        {showLabel && !decorative ? <span className="sr-only">{`${percent}% read`}</span> : null}
      </div>
    );
  }

  if (variant === "ring") {
    const ringRadius = (size - thickness) / 2;

    return (
      <div {...ariaProps} className={cn(POSITION_CLASSES[position], "inline-flex shrink-0 items-center justify-center", className)}>
        <svg aria-hidden="true" className="-rotate-90" height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
          <circle className="text-ink/12" cx={size / 2} cy={size / 2} fill="none" r={ringRadius} stroke="currentColor" strokeWidth={thickness} />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            fill="none"
            pathLength={1}
            r={ringRadius}
            stroke={color}
            strokeLinecap="round"
            strokeWidth={thickness}
            style={{ pathLength: value }}
          />
        </svg>
        {showLabel ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <PercentFigure
              className="text-ink"
              percent={percent}
              style={{ fontSize: size * RING_LABEL_SIZE_RATIO, transform: `translateY(${NUMERAL_OPTICAL_LIFT})` }}
            />
          </span>
        ) : null}
      </div>
    );
  }

  if (variant === "number") {
    return (
      <div {...ariaProps} className={cn(POSITION_CLASSES[position], "inline-flex shrink-0 items-baseline text-4xl leading-none", className)}>
        <PercentFigure digitColor={color} percent={percent} />
        {showLabel ? (
          <span className="ml-[0.9em] text-[0.3em] font-medium uppercase leading-none tracking-[0.08em] text-ink-3">read</span>
        ) : null}
      </div>
    );
  }

  return (
    <div {...ariaProps} className={cn(POSITION_CLASSES[position], "flex items-center gap-1.5", className)}>
      {Array.from({ length: segments }, (_, index) => (
        <SegmentDash color={color} index={index} key={`scroll-progress-segment-${index}`} segments={segments} thickness={thickness} value={value} />
      ))}
      {showLabel ? <span className="ml-2 w-[3.25ch] text-right text-xs font-medium tabular-nums text-ink-3">{percent}%</span> : null}
    </div>
  );
}
