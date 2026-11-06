"use client";
import { useEffect, useRef } from "react";

// The opening (after spykercars.com, the owner's reference): a clean curtain, the VISTASY mark draws itself as
// a scan locking onto a face, the letters rise, then the curtain lifts from the bottom while the logo flies into
// the header and the hero rises into place. The drawing is CSS from the first paint; this only plays the exit,
// with the Web Animations API (no library on every page). It plays once per visit, on the home page, never under
// reduced motion: the boot script in the layout decides before the first paint (html.intro-on) and removes it
// after 5s whatever happens here, so a failed script can never leave the page covered.
const WORD = "VISTASY";
const EXPO = "cubic-bezier(0.87, 0, 0.13, 1)";
const SETTLE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DRAWN = 1700; // ms after navigation start when the drawing (CSS) has finished
const EXIT = 1050;

export function Intro() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const el = root.current;
    if (!el || !html.classList.contains("intro-on")) return;
    try {
      sessionStorage.setItem("vis-intro", "1");
    } catch {
      /* private mode: it may play again next time, nothing else */
    }
    let started = false;
    let timer = 0;
    const done = () => {
      html.classList.remove("intro-on", "intro-hold");
      el.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    };
    const exit = () => {
      if (started) return;
      started = true;
      window.clearTimeout(timer);
      inputs.forEach((type) => window.removeEventListener(type, exit));
      html.classList.remove("intro-hold"); // the hero's own entrance (words, lede, form) starts with the lift

      // the logo lands exactly on the header's: the mark on the mark, at the header's size
      const logo = el.querySelector<HTMLElement>(".intro-logo");
      const mark = el.querySelector<HTMLElement>(".intro-mark");
      const target = document.querySelector<HTMLElement>(".site-nav .wordmark .ico");
      if (logo && mark && target) {
        const L = logo.getBoundingClientRect();
        const I = mark.getBoundingClientRect();
        const N = target.getBoundingClientRect();
        if (N.width && I.width) {
          const s = N.width / I.width;
          const tx = N.left - L.left - s * (I.left - L.left);
          const ty = N.top - L.top - s * (I.top - L.top);
          logo.animate([{ transform: "none" }, { transform: `translate(${tx}px, ${ty}px) scale(${s})` }], { duration: EXIT, easing: EXPO, fill: "forwards" });
        }
      }
      // the curtain lifts from the bottom edge, so the hero is uncovered from the bottom up
      el.querySelector(".intro-curtain")?.animate([{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 0 100% 0)" }], { duration: EXIT, easing: EXPO, fill: "forwards" });
      // the hero rises into place behind it: the cards column by column, the phone last and furthest
      document.querySelectorAll<HTMLElement>("[data-intro] [data-collage-col]").forEach((col, c) =>
        Array.from(col.children).forEach((card, k) =>
          (card as HTMLElement).animate([{ transform: "translateY(140px)" }, { transform: "none" }], { duration: 1100, delay: 120 + c * 60 + k * 50, easing: SETTLE, fill: "backwards" })
        )
      );
      const phone = document.querySelector<HTMLElement>("[data-intro] [data-follow-inner] > *");
      phone?.animate([{ transform: "translateY(240px) scale(0.94)" }, { transform: "none" }], { duration: 1300, delay: 160, easing: SETTLE, fill: "backwards" });
      window.setTimeout(done, EXIT + 40);
    };
    // reading starts the page: any input skips straight to the lift
    const inputs = ["wheel", "keydown", "pointerdown", "touchstart"] as const;
    inputs.forEach((type) => window.addEventListener(type, exit, { once: true, passive: true }));
    timer = window.setTimeout(exit, Math.max(0, DRAWN - performance.now()));
    return () => {
      window.clearTimeout(timer);
      inputs.forEach((type) => window.removeEventListener(type, exit));
    };
  }, []);

  return (
    <div ref={root} className="intro" aria-hidden="true">
      <div className="intro-curtain" />
      <div className="intro-logo">
        <span className="intro-mark">
          {/* drawn: the four scan corners lock on, a scan passes, the face is found */}
          <svg viewBox="0 0 256 256" className="intro-draw">
            <path className="c c1" pathLength={1} d="M40 76V40h36" />
            <path className="c c2" pathLength={1} d="M180 40h36v36" />
            <path className="c c3" pathLength={1} d="M216 180v36h-36" />
            <path className="c c4" pathLength={1} d="M76 216H40v-36" />
            <circle className="ring" pathLength={1} cx="128" cy="128" r="64" transform="rotate(-90 128 128)" />
          </svg>
          <span className="intro-scan" />
          {/* then the mark itself, the same one the header carries */}
          <svg viewBox="0 0 256 256" className="intro-fill">
            <use href="/app/icons.svg#i-scan-smiley-fill" />
          </svg>
        </span>
        <span className="intro-word">
          {WORD.split("").map((ch, i) => (
            <span key={i} className="intro-l">
              <span style={{ "--i": i } as React.CSSProperties}>{ch}</span>
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
