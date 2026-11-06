"use client";
import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-client";
import { cn } from "@/lib/utils";

// A dispensing label that is set down onto its stage, then prints line by line ([data-row], the same
// anatomy the home hero prints), once, when it scrolls into view. Observed with IntersectionObserver so
// nothing waits for ScrollTrigger. Content is visible by default: only a label still below the fold is
// hidden first (in a layout effect, before paint); reduced motion and no JavaScript show it as is.
// The root animates its own transform, so it must not also carry data-speed or data-tilt: put depth on a
// wrapper outside it and the tilt on a child inside it (the root is that child's perspective scene).
export function PrintOnView({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return; // already in view: leave it
      const rows = el.querySelectorAll("[data-row]");
      gsap.set(el, { opacity: 0, y: 40, scale: 0.97 });
      gsap.set(rows, { opacity: 0, y: 6 });
      const print = gsap
        .timeline({ paused: true, defaults: { ease: "settle" } })
        .to(el, { opacity: 1, y: 0, scale: 1, duration: 0.9, clearProps: "transform" }, 0)
        .to(rows, { opacity: 1, y: 0, duration: 0.42, stagger: 0.09, clearProps: "transform" }, 0.32);
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            print.play();
            io.disconnect();
          }
        },
        { threshold: 0.3 }
      );
      io.observe(el);
      return () => io.disconnect();
    },
    { scope: root }
  );

  return (
    <div ref={root} className={cn("tilt-scene", className)}>
      {children}
    </div>
  );
}
