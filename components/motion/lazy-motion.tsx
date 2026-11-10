"use client";
import { LazyMotion } from "motion/react";

// Every component uses the `m` component, so the initial bundle carries only Motion's core; the animation
// features (domMax: gestures, drag, layout) arrive in their own chunk after hydration. `strict` throws in
// development if a `motion.*` component sneaks back in and silently pulls the full library.
const features = () => import("./motion-features").then((mod) => mod.default);

export function LazyMotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={features} strict>
      {children}
    </LazyMotion>
  );
}
