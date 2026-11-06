"use client";
// Radar sweep, from craftwork.design/components/amicro/radar-sweep
// Source: amicro by Syed Subhan Uddin (github.com/Subhan-code/Amicro--Micro-transitions-), MIT licence.
// Same anatomy: a round dial with two concentric rings, a centre dot and a conic sweep turning once every
// 1.8s. Ported changes: framer-motion → motion/react; zinc → VISTASY ink (light), white (dark) and a third
// "accent" theme with a violet sweep for use over a photo; `size` (any CSS length, the rings scale with
// it); `active` pauses the turn (off screen) and reduced motion holds the sweep still.
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type RadarTheme = "light" | "dark" | "accent";

const SWEEP: Record<RadarTheme, string> = {
  light:
    "conic-gradient(from 0deg, transparent 50%, color-mix(in srgb, var(--ink) 2%, transparent) 65%, color-mix(in srgb, var(--ink) 10%, transparent) 85%, color-mix(in srgb, var(--ink) 45%, transparent) 100%)",
  dark: "conic-gradient(from 0deg, transparent 50%, rgba(255,255,255,0.02) 65%, rgba(255,255,255,0.15) 85%, rgba(255,255,255,0.55) 100%)",
  accent:
    "conic-gradient(from 0deg, transparent 50%, color-mix(in srgb, var(--cross) 3%, transparent) 65%, color-mix(in srgb, var(--cross) 18%, transparent) 85%, color-mix(in srgb, var(--cross) 56%, transparent) 100%)",
};
const EDGE: Record<RadarTheme, { outer: string; ring: string; dot: string }> = {
  light: { outer: "border-ink/10", ring: "border-ink/5", dot: "bg-ink/80" },
  dark: { outer: "border-white/10", ring: "border-white/5", dot: "bg-white/80" },
  accent: { outer: "border-white/55", ring: "border-white/30", dot: "bg-cross" },
};

export const RadarSweep = ({ theme = "light", size = "3rem", active = true, className }: { theme?: RadarTheme; size?: string; active?: boolean; className?: string }) => {
  const reduce = useReducedMotion();
  const turning = active && !reduce;
  const e = EDGE[theme];
  return (
    <div aria-hidden="true" className={cn("relative flex aspect-square items-center justify-center overflow-hidden rounded-full border", e.outer, className)} style={{ height: size }}>
      {/* Concentric rings */}
      <div className={cn("absolute size-2/3 rounded-full border", e.ring)} />
      <div className={cn("absolute size-1/3 rounded-full border", e.ring)} />

      {/* Center dot */}
      <div className={cn("absolute size-1.5 rounded-full", e.dot)} />

      {/* Sweep hand */}
      <motion.div
        className="absolute inset-0 origin-center"
        style={{ background: SWEEP[theme] }}
        initial={false}
        animate={{ rotate: turning ? 360 : 0 }}
        transition={turning ? { duration: 1.8, repeat: Infinity, ease: "linear" } : { duration: 0 }}
      />
    </div>
  );
};
