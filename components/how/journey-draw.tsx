"use client";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-client";

// The hero's one moment (diagram-design + gsap): the journey's wires draw in the order the app runs the
// stages, then the repeat loop draws back to the selfie and its interval appears.
// - On screen when the page opens (wide screens): it plays once, as the card settles.
// - Below the fold (phones): it draws with the scroll, its leading edge following a line at 78% of the screen
//   (what is already above that line draws in as the card settles).
// The page's data-draw preset cannot do this: it skips anything on screen at load, and a dash offset on the
// dashed loop would turn it solid; the diagram's own masks do the drawing (components/diagrams/journey.tsx).
// A scroll listener rather than ScrollTrigger keeps ScrollTrigger off the first paint, as the home hero does.
// Until this runs, how.css holds the wires back (html.js); if it has not run by the motion fallback (1.2s),
// the complete diagram shows and stays. Reduced motion and no JavaScript: the complete diagram.
export function JourneyDraw({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const root = ref.current;
      if (!root || !contextSafe || prefersReducedMotion()) return;
      // a slow first load: the fallback has already shown the finished diagram, so leave it
      const late = document.documentElement.classList.contains("motion-fallback") && parseFloat(getComputedStyle(root).opacity) > 0.5;
      const svg = Array.from(root.querySelectorAll("svg")).find((s) => s.getBoundingClientRect().width > 0 && s.querySelector("[data-sweep]"));
      const sweep = svg?.querySelector<SVGRectElement>("[data-sweep]");
      const loop = svg?.querySelector<SVGPathElement>("[data-loop-draw]");
      const label = svg?.querySelector<SVGGElement>("[data-loop-label]");
      root.dataset.drawReady = "";
      if (late || !svg || !sweep || !loop || !label) return;

      const vertical = sweep.dataset.sweep === "y";
      const size = vertical ? "height" : "width";
      const full = Number(sweep.getAttribute(size));
      const len = Number(loop.dataset.len);

      if (svg.getBoundingClientRect().bottom <= window.innerHeight) {
        gsap
          .timeline({ delay: 0.75 })
          .fromTo(sweep, { attr: { [size]: 0 } }, { attr: { [size]: full }, duration: 1.15, ease: "power1.inOut" })
          .fromTo(loop, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.85, ease: "power2.inOut" }, "-=0.05")
          .fromTo(label, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "settle" }, "-=0.45");
        return;
      }

      // with the scroll: the wires take 76% of the way, the loop 18%, its label the rest
      const draw = gsap
        .timeline({ paused: true, defaults: { ease: "none" } })
        .fromTo(sweep, { attr: { [size]: 0 } }, { attr: { [size]: full }, duration: 0.76 })
        .fromTo(loop, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.18 })
        .fromTo(label, { opacity: 0 }, { opacity: 1, duration: 0.06 });
      const at = () => {
        const r = svg.getBoundingClientRect();
        const vh = window.innerHeight;
        // phones: the leading edge sits on a line at 78% of the screen; wide: from the top at 85% to 40%
        return gsap.utils.clamp(0, 1, vertical ? (vh * 0.78 - r.top) / r.height : (vh * 0.85 - r.top) / (vh * 0.45));
      };
      // what is already above the line draws in as the card settles; the rest follows the scroll
      gsap.to(draw, { progress: at(), duration: 1.1, ease: "power1.inOut", delay: 0.75 });
      const follow = contextSafe(() => {
        gsap.to(draw, { progress: at(), duration: 0.5, ease: "power2.out", overwrite: true });
      });
      window.addEventListener("scroll", follow, { passive: true });
      window.addEventListener("resize", follow);
      return () => {
        window.removeEventListener("scroll", follow);
        window.removeEventListener("resize", follow);
      };
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className} data-hero-fade="2">
      {children}
    </div>
  );
}
