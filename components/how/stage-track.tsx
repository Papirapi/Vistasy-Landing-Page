"use client";
import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-client";
import { cn } from "@/lib/utils";

type Props = { children: React.ReactNode; labelledBy: string; phase: string; className?: string };

const meterValue = (bar: Element) => parseFloat(getComputedStyle(bar.parentElement!).getPropertyValue("--v")) || 0;

// What each stage's artefact does in the app, played once when it is actually on screen (micro-demos inside
// product artefacts). The waiting state is set here, never in the markup: without JavaScript or with reduced
// motion every artefact shows its final state.
function demo(stage: string, shot: HTMLElement): gsap.core.Timeline {
  const q = (s: string) => Array.from(shot.querySelectorAll<HTMLElement>(s));
  const tl = gsap.timeline({ paused: true, defaults: { ease: "settle" } });
  // a chip is chosen: its state flips (the kit's chip transition), then its tick lands
  const choose = (chips: HTMLElement[], at: number, step: number) => {
    const ticks = chips.map((c) => c.querySelector(".ico"));
    gsap.set(chips, { attr: { "data-on": "false" } });
    gsap.set(ticks, { opacity: 0, scale: 0.4 });
    chips.forEach((c, i) => tl.set(c, { attr: { "data-on": "true" } }, at + i * step).to(ticks[i], { opacity: 1, scale: 1, duration: 0.35 }, at + i * step));
  };
  // a scan line passes once over the thing being checked
  const scan = (line: HTMLElement | undefined, at: number, duration: number) => {
    if (!line) return;
    const h = line.parentElement?.clientHeight ?? 0;
    tl.fromTo(line, { y: 0, opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.1 }, { y: h - 2, duration, ease: "power1.inOut" }, { opacity: 0, duration: 0.18 }] }, at);
  };
  switch (stage) {
    case "consent": {
      const tag = q(".v-tag");
      gsap.set(tag, { opacity: 0, y: 6 });
      tl.to(tag, { opacity: 1, y: 0, duration: 0.45 }, 0);
      choose(q('.chip[data-on="true"]'), 0.6, 0);
      break;
    }
    case "selfie": {
      const face = q(".how-face");
      const tick = q(".how-hint .ico");
      gsap.set(face, { opacity: 0, scale: 1.12 });
      gsap.set(tick, { opacity: 0, scale: 0.4 });
      scan(q(".how-scan")[0], 0, 0.95);
      tl.to(face, { opacity: 1, scale: 1, duration: 0.5 }, 0.55).to(tick, { opacity: 1, scale: 1, duration: 0.35 }, 1.05);
      break;
    }
    case "questions":
      choose(q('.chip[data-on="true"]'), 0.15, 0.4);
      break;
    case "readings": {
      const bars = q(".meter i");
      const tag = q(".v-tag");
      gsap.set(bars, { scaleX: 0 });
      gsap.set(tag, { opacity: 0, y: 6 });
      tl.to(bars, { scaleX: (_i: number, el: HTMLElement) => meterValue(el), duration: 1, stagger: 0.09 }, 0).to(tag, { opacity: 1, y: 0, duration: 0.4 }, 0.85);
      break;
    }
    case "routine": {
      // the label prints line by line, as in the hero of the home page
      const rows = q("[data-row]");
      gsap.set(rows, { opacity: 0, y: 6 });
      tl.to(rows, { opacity: 1, y: 0, duration: 0.4, stagger: 0.09 }, 0.05);
      break;
    }
    case "check": {
      const band = q(".verdict-band");
      const icon = q(".vb-ic");
      gsap.set(band, { opacity: 0, y: 10 });
      gsap.set(icon, { scale: 0.7 });
      scan(q(".how-scan")[0], 0, 0.6);
      tl.to(band, { opacity: 1, y: 0, duration: 0.5 }, 0.7).to(icon, { scale: 1, duration: 0.45 }, 0.8);
      break;
    }
    case "progress": {
      const first = q('[data-scan="first"] .meter i');
      const later = q('[data-scan="later"] .meter i');
      gsap.set([...first, ...later], { scaleX: 0 });
      tl.to(first, { scaleX: (_i: number, el: HTMLElement) => meterValue(el), duration: 0.9, stagger: 0.08 }, 0).to(later, { scaleX: (_i: number, el: HTMLElement) => meterValue(el), duration: 0.9, stagger: 0.08 }, 0.6);
      break;
    }
  }
  return tl;
}

// The seven stages as a horizontal journey. lib/motion.ts pins [data-hscroll] and scrubs the track sideways on
// wide screens (its bar follows); phones and reduced motion keep native scroll-snap. This adds what the preset
// does not do:
// - the phase of the card at the centre of the screen lights its name over the bar (IntersectionObserver,
//   pinned or native);
// - on native scroll the bar follows the track (the preset drives it only while pinned);
// - each artefact plays its micro-demo when it is on screen. The page's meter preset is kept off these meters:
//   it fires on vertical position, so it would fill them while they are still off to the side.
export function StageTrack({ children, labelledBy, phase, className }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const sec = ref.current;
      const track = sec?.querySelector<HTMLElement>(".hscroll-track");
      if (!sec || !track) return;
      const bar = sec.querySelector<HTMLElement>(".hscroll-bar");
      const cards = Array.from(sec.querySelectorAll<HTMLElement>("[data-stage]"));
      sec.querySelectorAll("[data-meters]").forEach((el) => el.removeAttribute("data-meters"));

      const centre = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const ph = (e.target as HTMLElement).dataset.phase;
            if (e.isIntersecting && ph) sec.dataset.phase = ph;
          }
        },
        { rootMargin: "0px -49.5% 0px -49.5%" }
      );
      cards.forEach((c) => centre.observe(c));

      const follow = () => {
        if (!bar || sec.hasAttribute("data-pinned")) return;
        const max = track.scrollWidth - track.clientWidth;
        bar.style.setProperty("--p", String(max > 0 ? track.scrollLeft / max : 0));
      };
      track.addEventListener("scroll", follow, { passive: true });
      follow();

      let shown: IntersectionObserver | undefined;
      if (!prefersReducedMotion()) {
        const plays = new Map<Element, gsap.core.Timeline>();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        cards.forEach((card) => {
          const shot = card.querySelector<HTMLElement>("[data-shot]");
          if (!shot || !card.dataset.stage) return;
          // already on screen (a reload part way down): keep its final state, no flash
          const r = shot.getBoundingClientRect();
          if (r.left < vw && r.right > 0 && r.top < vh && r.bottom > 0) return;
          plays.set(shot, demo(card.dataset.stage, shot));
        });
        shown = new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (e.intersectionRatio < 0.6) continue;
              plays.get(e.target)?.play();
              shown?.unobserve(e.target);
            }
          },
          { threshold: 0.6 }
        );
        plays.forEach((_tl, shot) => shown?.observe(shot));
      }

      return () => {
        centre.disconnect();
        shown?.disconnect();
        track.removeEventListener("scroll", follow);
      };
    },
    { scope: ref }
  );

  return (
    <section ref={ref} data-hscroll="" data-phase={phase} aria-labelledby={labelledBy} className={cn("hscroll", className)}>
      {children}
    </section>
  );
}
