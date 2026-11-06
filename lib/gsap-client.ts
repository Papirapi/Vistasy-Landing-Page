"use client";
// One GSAP instance for client components (gsap-react skill): register useGSAP and the site's
// signature ease once. "settle" = cubic-bezier(0.22, 1, 0.36, 1), the same curve as CSS --ease-out.
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, CustomEase);
  if (!CustomEase.get("settle")) CustomEase.create("settle", "0.22,1,0.36,1");
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, useGSAP };
