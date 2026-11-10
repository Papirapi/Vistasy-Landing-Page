"use client";
// Siri orb, from craftwork.design/components/smooth-ui/siri-orb
// Source: Smooth UI by Eduardo Calvo (github.com/educlopez/smoothui), MIT licence. Same anatomy: a disc of
// seven rotating conic gradients (blurred, contrast-pushed, saturated), a dotted overlay, a drifting specular
// sheen and a lit rim, a bloom in the orb's own palette, all driven by the shared AI state presets (speed,
// scale, saturation, hue, glow, breathing at rest) and an optional amplitude that tightens and swells it.
// Changed for VISTASY: only the parts of ../ai-core the orb reads are ported below (the state table without
// the fields other Smooth UI pieces use, useAmplitudeValue and the simulated speech envelope; no microphone
// hook); the scoped <style> moved to the craftwork block at the end of app/globals.css, with the custom
// property and keyframes renamed (--siri-angle, siri-orb-rotate) so they cannot collide; colours are passed
// from our tokens by the caller; the simulated envelope's frame loop runs only while the state listens to it,
// and the orb's loops pause while it is off screen.
import { type MotionStyle, type MotionValue, m, type TargetAndTransition, type Transition, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ── from ai-core: the shared state contract ── */

export type AIState = "idle" | "listening" | "thinking" | "streaming" | "done" | "error";

type AIStateMotion = {
  /** Outer bloom strength, 0-1. */
  glow: number;
  /** Palette hue rotation in degrees. */
  hueRotate: number;
  /** Overall motion energy, 0-1 (the simulated envelope reads it). */
  intensity: number;
  /** `breathe` is the only motif the orb expresses itself. */
  motif: "breathe" | "receive" | "scan" | "pulse" | "ping" | "fault";
  /** How much amplitude reaches the surface, 0 = ignore it. */
  reactivity: number;
  /** Chroma multiplier. */
  saturation: number;
  /** Resting scale of the surface. */
  scale: number;
  /** Ambient loop speed multiplier. */
  speed: number;
};

const AI_STATE_MOTION: Record<AIState, AIStateMotion> = {
  done: { glow: 0.7, hueRotate: 0, intensity: 0.4, motif: "ping", reactivity: 0, saturation: 1, scale: 1.1, speed: 0.8 },
  error: { glow: 0.25, hueRotate: 0, intensity: 0.5, motif: "fault", reactivity: 0, saturation: 0.3, scale: 0.96, speed: 1 },
  idle: { glow: 0.15, hueRotate: 0, intensity: 0.3, motif: "breathe", reactivity: 0, saturation: 0.75, scale: 0.94, speed: 0.6 },
  listening: { glow: 0.6, hueRotate: 0, intensity: 0.75, motif: "receive", reactivity: 1, saturation: 1.05, scale: 1.06, speed: 1 },
  streaming: { glow: 0.45, hueRotate: -10, intensity: 0.6, motif: "pulse", reactivity: 0.6, saturation: 1, scale: 1.02, speed: 1.4 },
  thinking: { glow: 0.35, hueRotate: 18, intensity: 1, motif: "scan", reactivity: 0.15, saturation: 1, scale: 1, speed: 2.4 },
};

const getAIStateMotion = (state: AIState | undefined): AIStateMotion => AI_STATE_MOTION[state ?? "idle"] ?? AI_STATE_MOTION.idle;

export type AIAmplitude = number | MotionValue<number> | undefined;

const isMotionValue = (value: AIAmplitude): value is MotionValue<number> => typeof value === "object" && value !== null && "get" in value;

const useAmplitudeValue = (amplitude: AIAmplitude): MotionValue<number> => {
  const fallback = useMotionValue(0);
  const numeric = typeof amplitude === "number" ? amplitude : null;
  useEffect(() => {
    if (numeric !== null) fallback.set(numeric);
  }, [numeric, fallback]);
  return isMotionValue(amplitude) ? amplitude : fallback;
};

/** A speech-like envelope that follows the state, so the orb can "speak" without a microphone. */
export const useSimulatedAmplitude = (state: AIState = "idle"): MotionValue<number> => {
  const amplitude = useMotionValue(0);
  const { reactivity, speed, intensity } = getAIStateMotion(state);
  const live = reactivity > 0;
  // the frame loop runs only while the state listens to amplitude (the original ran it on every frame)
  useEffect(() => {
    if (!live) {
      amplitude.set(0);
      return;
    }
    let raf = 0;
    const tick = (time: number) => {
      const t = time / 1000;
      // three detuned sines read as organic; a single sine reads as a metronome
      const envelope = 0.5 + 0.3 * Math.sin(t * 2.1 * speed) + 0.14 * Math.sin(t * 5.3 * speed + 1.7) + 0.06 * Math.sin(t * 11.7 * speed + 0.4);
      amplitude.set(Math.min(1, Math.max(0, envelope * intensity)));
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [live, speed, intensity, amplitude]);
  return amplitude;
};

/* ── the orb ── */

const SIZE_THRESHOLD_SMALL = 50;
const SIZE_THRESHOLD_TINY = 30;
const SIZE_THRESHOLD_MEDIUM = 100;
const BLUR_MULTIPLIER_SMALL = 0.008;
const BLUR_MIN_SMALL = 1;
const BLUR_MULTIPLIER_LARGE = 0.015;
const BLUR_MIN_LARGE = 4;
const CONTRAST_MULTIPLIER_SMALL = 0.004;
const CONTRAST_MIN_SMALL = 1.2;
const CONTRAST_MULTIPLIER_LARGE = 0.008;
const CONTRAST_MIN_LARGE = 1.5;
const DOT_SIZE_MULTIPLIER_SMALL = 0.004;
const DOT_SIZE_MIN_SMALL = 0.05;
const DOT_SIZE_MULTIPLIER_LARGE = 0.008;
const DOT_SIZE_MIN_LARGE = 0.1;
const SHADOW_MULTIPLIER_SMALL = 0.004;
const SHADOW_MIN_SMALL = 0.5;
const SHADOW_MULTIPLIER_LARGE = 0.008;
const SHADOW_MIN_LARGE = 2;
const MASK_RADIUS_TINY = "0%";
const MASK_RADIUS_SMALL = "5%";
const MASK_RADIUS_MEDIUM = "15%";
const MASK_RADIUS_LARGE = "25%";
const CONTRAST_TINY = 1.1;
const CONTRAST_MULTIPLIER_FINAL = 1.2;
const CONTRAST_MIN_FINAL = 1.3;
/** Loud audio tightens the gradient, which reads as the orb "focusing". */
const AMPLITUDE_BLUR_FALLOFF = 0.45;
/** Amplitude adds at most 12% of extra size on top of the state scale. */
const AMPLITUDE_SCALE_GAIN = 0.12;
const ERROR_SHAKE_KEYFRAMES = [0, -3, 3, 0];
const ERROR_SHAKE_DURATION = 0.18;
const EASE_IN_OUT = [0.645, 0.045, 0.355, 1] as const;
const GLOW_BLUR_RATIO = 0.28;
const GLOW_MAX_OPACITY = 0.7;
const RIM_RATIO = 0.06;
const RIM_MIN = 1.5;
const DRIFT_BASE_SECONDS = 12;
const BREATHE_SCALE = [1, 1.035, 1];
const BREATHE_SECONDS = 5.5;
const SPRING_DEFAULT: Transition = { bounce: 0.1, duration: 0.25, type: "spring" };

export interface SiriOrbProps {
  amplitude?: AIAmplitude;
  /** Ambient rotation period in seconds, before the state speed multiplier. */
  animationDuration?: number;
  className?: string;
  colors?: { bg?: string; c1?: string; c2?: string; c3?: string; c4?: string };
  size?: string;
  state?: AIState;
}

export function SiriOrb({ size = "192px", className, colors, animationDuration = 20, amplitude, state = "idle" }: SiriOrbProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // off screen the loops stop (data-paused pauses the CSS rotation and drift; the breathing reads it here)
  const [offscreen, setOffscreen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const shouldReduceMotion = reduce || offscreen;
  const amplitudeValue = useAmplitudeValue(amplitude);
  const stateMotion = getAIStateMotion(state);

  // the original's defaults; VISTASY passes its violet and lavender tokens instead
  const defaultColors = {
    bg: "oklch(92% 0.03 300)",
    c1: "oklch(68% 0.21 350)",
    c2: "oklch(70% 0.18 210)",
    c3: "oklch(66% 0.2 285)",
    c4: "oklch(72% 0.19 325)",
  };
  const finalColors = { ...defaultColors, ...colors };
  const glowColor = finalColors.c2;

  const sizeValue = Number.parseInt(size.replace("px", ""), 10);
  const small = sizeValue < SIZE_THRESHOLD_SMALL;
  const blurAmount = small ? Math.max(sizeValue * BLUR_MULTIPLIER_SMALL, BLUR_MIN_SMALL) : Math.max(sizeValue * BLUR_MULTIPLIER_LARGE, BLUR_MIN_LARGE);
  const contrastAmount = small ? Math.max(sizeValue * CONTRAST_MULTIPLIER_SMALL, CONTRAST_MIN_SMALL) : Math.max(sizeValue * CONTRAST_MULTIPLIER_LARGE, CONTRAST_MIN_LARGE);
  const dotSize = small ? Math.max(sizeValue * DOT_SIZE_MULTIPLIER_SMALL, DOT_SIZE_MIN_SMALL) : Math.max(sizeValue * DOT_SIZE_MULTIPLIER_LARGE, DOT_SIZE_MIN_LARGE);
  const shadowSpread = small ? Math.max(sizeValue * SHADOW_MULTIPLIER_SMALL, SHADOW_MIN_SMALL) : Math.max(sizeValue * SHADOW_MULTIPLIER_LARGE, SHADOW_MIN_LARGE);
  const maskRadius = sizeValue < SIZE_THRESHOLD_TINY ? MASK_RADIUS_TINY : small ? MASK_RADIUS_SMALL : sizeValue < SIZE_THRESHOLD_MEDIUM ? MASK_RADIUS_MEDIUM : MASK_RADIUS_LARGE;
  const finalContrast = sizeValue < SIZE_THRESHOLD_TINY ? CONTRAST_TINY : small ? Math.max(contrastAmount * CONTRAST_MULTIPLIER_FINAL, CONTRAST_MIN_FINAL) : contrastAmount;

  const reactivity = shouldReduceMotion ? 0 : stateMotion.reactivity;
  const reactiveBlur = useTransform(amplitudeValue, (level) => `${blurAmount * (1 - level * reactivity * AMPLITUDE_BLUR_FALLOFF)}px`);
  const reactiveScale = useTransform(amplitudeValue, (level) => stateMotion.scale + level * reactivity * AMPLITUDE_SCALE_GAIN);

  const loopDuration = shouldReduceMotion ? animationDuration : animationDuration / stateMotion.speed;
  const rim = Math.max(sizeValue * RIM_RATIO, RIM_MIN);
  const driftDuration = (DRIFT_BASE_SECONDS / (1 + stateMotion.speed)) * 2;

  const rootAnimate: TargetAndTransition = shouldReduceMotion
    ? { scale: 1, x: 0 }
    : state === "error"
      ? { scale: 1, x: ERROR_SHAKE_KEYFRAMES }
      : stateMotion.motif === "breathe"
        ? { scale: BREATHE_SCALE, x: 0 }
        : { scale: 1, x: 0 };
  const rootTransition: Transition = shouldReduceMotion
    ? { duration: 0 }
    : state === "error"
      ? { duration: ERROR_SHAKE_DURATION, ease: EASE_IN_OUT }
      : stateMotion.motif === "breathe"
        ? { duration: BREATHE_SECONDS, ease: EASE_IN_OUT, repeat: Number.POSITIVE_INFINITY }
        : SPRING_DEFAULT;

  return (
    // the gradient disc clips its own overflow, so the bloom lives in a wrapper rather than inside it
    <m.div ref={ref} animate={rootAnimate} className={cn("relative", className)} data-paused={offscreen ? "" : undefined} style={{ "--orb-size": size, height: size, width: size } as MotionStyle} transition={rootTransition}>
      <m.div
        animate={{ opacity: stateMotion.glow * GLOW_MAX_OPACITY }}
        className="absolute rounded-full"
        style={{ background: `radial-gradient(circle at 50% 50%, ${glowColor} 0%, transparent 64%)`, filter: `blur(calc(var(--orb-size) * ${GLOW_BLUR_RATIO}))`, inset: "-12%" }}
        transition={shouldReduceMotion ? { duration: 0 } : SPRING_DEFAULT}
      />
      <m.div
        className="siri-orb"
        style={
          {
            "--animation-duration": `${loopDuration}s`,
            "--bg": finalColors.bg,
            "--blur-amount": reactiveBlur,
            "--c1": finalColors.c1,
            "--c2": finalColors.c2,
            "--c3": finalColors.c3,
            "--c4": finalColors.c4,
            "--contrast-amount": finalContrast,
            "--dot-size": `${dotSize}px`,
            "--drift-duration": `${driftDuration}s`,
            "--mask-radius": maskRadius,
            "--rim": `${rim}px`,
            "--shadow-spread": `${shadowSpread}px`,
            // saturation and hue affect the gradient disc only
            filter: `saturate(${stateMotion.saturation}) hue-rotate(${stateMotion.hueRotate}deg)`,
            height: "100%",
            scale: reactiveScale,
            width: "100%",
          } as MotionStyle
        }
      >
        <span aria-hidden="true" className="siri-orb-layer siri-orb-sheen" />
        <span aria-hidden="true" className="siri-orb-layer siri-orb-rim" />
      </m.div>
    </m.div>
  );
}
