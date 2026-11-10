// Page-level motion, loaded lazily after first paint (frontend-dev: lazy-load heavy motion).
// gsap.com/scroll: ScrollSmoother for smooth scrolling and depth (data-speed / data-lag), ScrollTrigger for
// pins and scrubs. Everything sits inside one gsap.matchMedia(), so reduced motion and cleanup are automatic.
// The smoother only runs for fine pointers and never under reduced motion; touch keeps native scrolling.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { CustomEase } from "gsap/CustomEase";

declare global {
  interface Window {
    /** the live smoother, so the mobile menu can pause scrolling and tests can jump */
    __smoother?: ScrollSmoother | null;
  }
}

let registered = false;
function ensure() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, CustomEase);
  if (!CustomEase.get("settle")) CustomEase.create("settle", "0.22,1,0.36,1");
  registered = true;
}

// Only animate what the reader has not seen yet: anything already on screen stays put (no flash).
const below = (el: Element, vh: number) => el.getBoundingClientRect().top > vh * 0.92;
const navH = () => (document.querySelector(".site-nav") as HTMLElement | null)?.offsetHeight ?? 72;

// Scrollytelling: the step in the middle of the screen chooses the panel. This runs for everyone, reduced
// motion included (it carries meaning, not decoration); only the pin depends on motion and width.
function scrolly(pin: boolean) {
  gsap.utils.toArray<HTMLElement>("[data-scrolly]").forEach((root) => {
    const steps = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-scrolly-step]"));
    const panels = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-scrolly-panel]"));
    const visual = root.querySelector<HTMLElement>(".scrolly-visual");
    const list = root.querySelector<HTMLElement>("[data-scrolly-steps]");
    const show = (i: number) => {
      steps.forEach((s, k) => (s.dataset.on = String(k === i)));
      panels.forEach((p, k) => (p.dataset.on = String(k === i)));
      root.style.setProperty("--step-p", String(steps.length > 1 ? i / (steps.length - 1) : 1));
    };
    steps.forEach((step, i) => ScrollTrigger.create({ trigger: step, start: "top 58%", end: "bottom 58%", onToggle: (self) => self.isActive && show(i) }));
    if (pin && visual && list) {
      const top = navH() + 32;
      ScrollTrigger.create({ trigger: visual, start: `top ${top}`, endTrigger: list, end: () => `bottom ${top + visual.offsetHeight}`, pin: true, pinSpacing: false });
    }
  });
}

export function initMotion(): () => void {
  ensure();
  const mm = gsap.matchMedia();

  mm.add({ reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if ((ctx.conditions as { reduce: boolean }).reduce) scrolly(false);
  });

  mm.add(
    {
      motion: "(prefers-reduced-motion: no-preference)",
      fine: "(hover: hover) and (pointer: fine)",
      wide: "(min-width: 1024px)",
    },
    (ctx) => {
      const { motion, fine, wide } = ctx.conditions as { motion: boolean; fine: boolean; wide: boolean };
      if (!motion) return; // reduced motion: the server-rendered final state is the design
      const cleanups: (() => void)[] = [];

      // 0. smooth scroll and depth, desktop fine pointers only (gsap.com/scroll: ScrollSmoother).
      //    effects:true turns data-speed (parallax) and data-lag (trailing) attributes into depth.
      let smoother: ScrollSmoother | null = null;
      if (fine && document.getElementById("smooth-wrapper")) {
        smoother = ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1.05, effects: true, smoothTouch: false });
        window.__smoother = smoother;
      }

      const vh = window.innerHeight;

      // the journey's lanes change the layout of the home page, so they go on before anything is measured
      const followOn = wide && !!document.querySelector("[data-follow] [data-follow-phone]") && !!document.querySelector("[data-dock]");
      if (followOn) {
        document.documentElement.classList.add("follow-on");
        cleanups.push(() => document.documentElement.classList.remove("follow-on"));
      }

      // 1. headings rise word by word through a mask (masked-reveal: 82%, 0.8s, 0.035s per word)
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
        if (el.closest("[data-intro]") || el.hasAttribute("data-scrub-words") || !below(el, vh)) return;
        const words = el.querySelectorAll(".w");
        gsap.fromTo(
          words,
          { yPercent: 112 },
          { yPercent: 0, duration: 0.8, ease: "settle", stagger: { each: 0.035, amount: Math.min(0.42, words.length * 0.035) }, scrollTrigger: { trigger: el, start: "top 84%", once: true } }
        );
      });

      // 1b. the brand promise reads in word by word with the scroll (scroll-scrubbed-word-reveal),
      //     forward only, quiet floor 0.4, done by 62% of the viewport
      gsap.utils.toArray<HTMLElement>("[data-scrub-words]").forEach((el) => {
        const words = gsap.utils.toArray<HTMLElement>(el.querySelectorAll(".w"));
        const n = words.length;
        const apply = (p: number) =>
          words.forEach((w, i) => {
            // floor 0.76: unread words still meet AA contrast on the ground (0.4 failed the audit)
            w.style.opacity = String(0.76 + 0.24 * Math.min(1, Math.max(0, p * n - i)));
          });
        let read = 0;
        const advance = (p: number) => {
          if (p <= read && read > 0) return;
          read = p;
          apply(p);
        };
        const st = ScrollTrigger.create({ trigger: el, start: "top 92%", end: "top 62%", onUpdate: (self) => advance(self.progress) });
        advance(st.progress);
      });

      // 2. blocks rise into place, batched so neighbours stagger together. data-reveal="lift" is for
      //    elevated cards: a longer rise and a slight scale, as if set down onto the page.
      //    opacity only (never autoAlpha): hidden content must stay in the accessibility tree.
      // (the panel the travelling phone lands in keeps still, so the landing is exact however fast the scroll)
      const blocks = gsap.utils.toArray<HTMLElement>("[data-reveal]").filter((el) => !el.closest("[data-intro]") && below(el, vh) && !(followOn && el.querySelector("[data-dock]")));
      const lifts = blocks.filter((el) => el.dataset.reveal === "lift");
      const plain = blocks.filter((el) => el.dataset.reveal !== "lift");
      if (plain.length) {
        gsap.set(plain, { opacity: 0, y: 14 });
        ScrollTrigger.batch(plain, { start: "top 88%", once: true, onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.7, ease: "settle", stagger: 0.08, overwrite: true }) });
      }
      if (lifts.length) {
        gsap.set(lifts, { opacity: 0, y: 48, scale: 0.965 });
        ScrollTrigger.batch(lifts, { start: "top 90%", once: true, onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, scale: 1, duration: 1, ease: "settle", stagger: 0.1, overwrite: true, clearProps: "transform" }) });
      }

      // 3. meters inside revealed product UI fill to their value (the measurement settling)
      gsap.utils.toArray<HTMLElement>("[data-meters]").forEach((group) => {
        if (group.closest("[data-intro]") || !below(group, vh)) return;
        const bars = group.querySelectorAll<HTMLElement>(".meter i");
        gsap.fromTo(bars, { scaleX: 0 }, { scaleX: (_i, t: HTMLElement) => parseFloat(getComputedStyle(t.parentElement!).getPropertyValue("--v")) || 0, duration: 1, ease: "settle", stagger: 0.09, scrollTrigger: { trigger: group, start: "top 85%", once: true } });
      });

      // 3b. numbers count up once when they arrive (Magic UI number-ticker anatomy); the final value is
      //     server-rendered and also given to screen readers, so the count is decoration only
      gsap.utils.toArray<HTMLElement>("[data-ticker]").forEach((el) => {
        if (!below(el, vh)) return;
        const end = Number(el.dataset.ticker);
        const dec = Number(el.dataset.decimals ?? 0);
        if (!Number.isFinite(end)) return;
        const fmt = new Intl.NumberFormat(document.documentElement.lang || "en", { minimumFractionDigits: dec, maximumFractionDigits: dec });
        const final = el.textContent;
        const o = { v: 0 };
        el.textContent = fmt.format(0);
        gsap.to(o, { v: end, duration: 1.3, ease: "power2.out", onUpdate: () => (el.textContent = fmt.format(o.v)), onComplete: () => (el.textContent = final), scrollTrigger: { trigger: el, start: "top 90%", once: true } });
        cleanups.push(() => (el.textContent = final));
      });

      // 3c. Sarah types, then answers (a demo that types: dots for a beat, then the line fades in)
      gsap.utils.toArray<HTMLElement>("[data-typing]").forEach((el) => {
        if (!below(el, vh)) return;
        el.dataset.typing = "on";
        ScrollTrigger.create({ trigger: el, start: "top 86%", once: true, onEnter: () => gsap.delayedCall(1.1, () => (el.dataset.typing = "done")) });
        cleanups.push(() => (el.dataset.typing = ""));
      });

      // 4. progress rails scrub with the reader (scroll-progress-timeline)
      gsap.utils.toArray<HTMLElement>("[data-rail]").forEach((rail) => {
        const fill = rail.querySelector("i");
        const track = rail.closest("[data-rail-scope]") ?? rail.parentElement;
        if (!fill || !track) return;
        gsap.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: track, start: "top 62%", end: "bottom 62%", scrub: 0.5 } });
      });

      // 5. diagram wires draw with the scroll (diagram-design + gsap): stroke-dashoffset only
      gsap.utils.toArray<SVGPathElement>("[data-draw]").forEach((path) => {
        if (!below(path, vh)) return;
        const len = path.getTotalLength();
        gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: path.closest("svg") ?? path, start: "top 82%", end: "top 42%", scrub: 0.6 } });
        cleanups.push(() => gsap.set(path, { clearProps: "strokeDasharray,strokeDashoffset" }));
      });

      // 5a. endless loops (aurora, marquee) pause off screen
      const io = new IntersectionObserver((entries) => entries.forEach((e) => e.target.toggleAttribute("data-offscreen", !e.isIntersecting)));
      document.querySelectorAll(".hero-card, .marquee").forEach((el) => io.observe(el));
      cleanups.push(() => {
        io.disconnect();
        document.querySelectorAll("[data-offscreen]").forEach((el) => el.removeAttribute("data-offscreen"));
      });

      // 5b. the hero card settles back as the page scrolls away from it (depth, gsap.com/scroll scrub)
      gsap.utils.toArray<HTMLElement>("[data-shrink]").forEach((el) => {
        gsap.to(el, { scale: 0.94, y: 28, ease: "none", scrollTrigger: { trigger: el, start: () => `top ${navH() + 12}`, end: "bottom top", scrub: 0.5 } });
      });

      // 6. scrollytelling: pinned whenever the smoother runs (CSS sticky cannot work inside its transformed
      //    content) or on wide screens; touch phones keep the CSS sticky panel with native scrolling
      scrolly(wide || !!smoother);

      // 6b. the journey (gsap.com/scroll: something always follows you). The hero's phone is pinned from the
      //     hero to the closing invite and travels with the reader: it glides beside the four steps (its screen
      //     follows the step being read), then each section turns it on its axis to show the next screen
      //     ([data-journey-turn]: edge-on at the middle of the turn, where the screen changes) and sets its size
      //     in that section's lane ([data-lane], always on the right, so it never crosses what is being read),
      //     until it lands in the invite panel ([data-dock]) and leaves with it. One pose function drives it from
      //     the scroll position, so scrolling back retraces it exactly.
      //     Wide screens with motion; elsewhere every section keeps its own visuals.
      if (followOn)
        document.querySelectorAll<HTMLElement>("[data-follow]").forEach((scope) => {
          const phone = scope.querySelector<HTMLElement>("[data-follow-phone]");
          const inner = scope.querySelector<HTMLElement>("[data-follow-inner]");
          const list = scope.querySelector<HTMLElement>("[data-follow-steps]");
          const dock = document.querySelector<HTMLElement>("[data-dock]");
          if (!phone || !inner || !list || !dock) return;
          const panels = gsap.utils.toArray<HTMLElement>(phone.querySelectorAll("[data-follow-panel]"));
          const cards = gsap.utils.toArray<HTMLElement>(list.querySelectorAll("[data-follow-step]"));
          const n = Math.min(cards.length, panels.length);
          let on = 0;
          const show = (i: number) => {
            if (i === on) return;
            on = i;
            panels.forEach((p, k) => (p.dataset.on = String(k === i)));
          };
          // where the screen changes, as scroll positions: read from the position like the pose, so a long jump
          // (back to the top, a link) always lands on the right screen
          const marks: { at: () => number; panel: number }[] = [];
          const top = navH() + 20;
          ScrollTrigger.create({ trigger: phone, start: `top ${top}`, endTrigger: dock, end: "center center", pin: true, pinSpacing: false });

          type Pose = { cx: number; cy: number; s: number };
          const W = () => inner.offsetWidth;
          const H = () => inner.offsetHeight;
          // where the phone sits untransformed (pinned, or in the hero before the pin)
          const home = (): Pose => {
            const r = phone.getBoundingClientRect();
            return { cx: r.left + W() / 2, cy: r.top + H() / 2, s: 1 };
          };
          // a lane: centred in it and in the screen under the header, as large as the lane and screen allow
          const lanePose = (lane: HTMLElement, size: number): Pose => {
            const r = lane.getBoundingClientRect();
            const sh = window.innerHeight;
            const nh = navH();
            return { cx: r.left + r.width / 2, cy: nh + (sh - nh) / 2, s: Math.min(size, (r.width * 0.96) / W(), (sh - nh - 64) / H()) };
          };
          // the landing: exactly on the slot, read live so it holds through the panel's own reveal
          const dockPose = (): Pose => {
            const r = dock.getBoundingClientRect();
            return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, s: r.width / W() };
          };

          const stations = gsap.utils.toArray<HTMLElement>("[data-journey]").map((sec) => {
            const lane = sec.querySelector<HTMLElement>("[data-lane]");
            const docked = sec.contains(dock);
            // the flight into this station: from its first edge entering the screen to its arrival. The first
            // leaves as soon as the reader scrolls, while the hero's cards disperse, so it never crosses the steps.
            const flight = docked
              ? ScrollTrigger.create({ trigger: sec, start: "top bottom", endTrigger: dock, end: "center center" })
              : ScrollTrigger.create({ trigger: sec, start: sec.dataset.journeyFrom === "0" ? 0 : "top bottom", end: sec.dataset.journeyEnd || "top 30%" });
            const size = Number(sec.dataset.journeySize) || 0.8;
            const pose = (): Pose => (docked ? dockPose() : lane ? lanePose(lane, size) : home());
            const panel = sec.dataset.journeyPanel === undefined ? undefined : Number(sec.dataset.journeyPanel);
            return { sec, flight, pose, panel, turn: sec.dataset.journeyTurn !== undefined };
          });

          // the screen: each step card switches it as it comes in to land, each later station on arrival
          cards.slice(0, n).forEach((card, i) => {
            const st = ScrollTrigger.create({ trigger: card, start: `top ${navH() + 40 + i * 16 + 240}` });
            marks.push({ at: () => st.start, panel: i });
          });
          stations.forEach((st) => {
            if (st.panel !== undefined) marks.push({ at: () => (st.flight.start + st.flight.end) / 2, panel: Math.min(st.panel, panels.length - 1) });
          });

          const inOut = gsap.parseEase("power2.inOut");
          const place = (y: number) => {
            const h0 = home();
            let from = h0;
            let pose = h0;
            let spin = 0;
            let breath = 0;
            for (const st of stations) {
              const a = st.flight.start;
              const b = Math.max(a + 1, st.flight.end);
              if (y <= a) break;
              const to = st.pose();
              if (y < b) {
                const t = inOut((y - a) / (b - a));
                // a turn: half a turn out to edge-on, the screen changes, half a turn back in; a glide leans a little
                spin = st.turn ? (t < 0.5 ? 180 * t : 180 * t - 180) : -14 * Math.sin(Math.PI * t);
                breath = 0.05 * Math.sin(Math.PI * t);
                pose = { cx: from.cx + (to.cx - from.cx) * t, cy: from.cy + (to.cy - from.cy) * t, s: from.s + (to.s - from.s) * t };
                break;
              }
              from = pose = to;
            }
            let screen = 0;
            for (const m of marks) if (y >= m.at()) screen = m.panel;
            show(screen);
            gsap.set(inner, { x: pose.cx - h0.cx, y: pose.cy - h0.cy, scale: pose.s * (1 - breath), rotationY: spin, transformPerspective: spin ? 1800 : 0 });
          };
          // one driver from the top of the page to the landing; its progress is the smoothed scroll position
          const drive = (self: ScrollTrigger) => place(self.start + (self.end - self.start) * self.progress);
          ScrollTrigger.create({ start: 0, endTrigger: dock, end: "center center", onUpdate: drive, onRefresh: drive });

          gsap.utils.toArray<HTMLElement>(scope.querySelectorAll("[data-collage-col]")).forEach((col, k) =>
            gsap.to(col, { y: -60 - k * 40, scale: 0.92, opacity: 0, ease: "none", scrollTrigger: { trigger: scope, start: `top ${top}`, end: () => `+=${window.innerHeight * 0.45}`, scrub: 0.6 } })
          );
          cleanups.push(() => {
            gsap.set(inner, { clearProps: "transform" });
            on = -1;
            show(0);
          });
        });

      // 7. stacking cards (GSAP showcase pattern): each card pins a little lower than the last and
      //    settles back (scale) as the next one slides over it. Wide screens only; phones get a list.
      if (wide)
        gsap.utils.toArray<HTMLElement>("[data-stack]").forEach((stack) => {
          const cards = gsap.utils.toArray<HTMLElement>(stack.querySelectorAll(".stack-card"));
          const last = cards[cards.length - 1];
          // every pin releases together when the last card lands in its slot, leaving a clean staircase;
          // the section's intro ([data-stack-aside]) stays anchored beside the stack for the same span
          const lastTop = navH() + 40 + (cards.length - 1) * 16;
          const aside = stack.parentElement?.querySelector<HTMLElement>("[data-stack-aside]");
          if (aside && !followOn) ScrollTrigger.create({ trigger: aside, start: `top ${navH() + 40}`, endTrigger: last, end: `top ${lastTop}`, pin: true, pinSpacing: false });
          cards.forEach((card, i) => {
            if (card === last) return;
            const top = navH() + 40 + i * 16;
            ScrollTrigger.create({ trigger: card, start: `top ${top}`, endTrigger: last, end: `top ${lastTop}`, pin: true, pinSpacing: false });
            gsap.to(card, { scale: 0.94, transformOrigin: "50% 0%", ease: "none", scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: `top ${top + 16}`, scrub: true } });
          });
        });

      // 8. horizontal journey: pin the section and scrub the track sideways; a bar shows the progress.
      //    Phones and reduced motion keep native horizontal scrolling with snap points.
      if (wide)
        gsap.utils.toArray<HTMLElement>("[data-hscroll]").forEach((sec) => {
          const track = sec.querySelector<HTMLElement>(".hscroll-track");
          const bar = sec.querySelector<HTMLElement>(".hscroll-bar");
          if (!track) return;
          sec.setAttribute("data-pinned", "");
          const dist = () => Math.max(0, track.scrollWidth - track.clientWidth);
          gsap.to(track, {
            x: () => -dist(),
            ease: "none",
            scrollTrigger: { trigger: sec, start: () => `top ${navH()}`, end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true, onUpdate: (self) => bar?.style.setProperty("--p", String(self.progress)) },
          });
          cleanups.push(() => sec.removeAttribute("data-pinned"));
        });

      // 9. tilt (beui tilt-card anatomy): elevated objects lean toward a fine pointer, at most a few degrees
      if (fine)
        gsap.utils.toArray<HTMLElement>("[data-tilt]").forEach((el) => {
          const max = Number(el.dataset.tilt) || 5;
          const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
          const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            ry(((e.clientX - r.left) / r.width - 0.5) * max * 2);
            rx(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
          };
          const leave = () => {
            rx(0);
            ry(0);
          };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
            gsap.set(el, { clearProps: "transform" });
          });
        });

      // fonts and images change layout once: measure again (guarded: the page may be gone by then)
      let disposed = false;
      const refresh = () => !disposed && ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
      if (document.readyState !== "complete") window.addEventListener("load", refresh, { once: true });
      // non-visual debug marker (optimize-web-animations): live trigger count, checked across route cycles
      document.documentElement.dataset.st = String(ScrollTrigger.getAll().length);

      return () => {
        disposed = true;
        cleanups.forEach((c) => c());
        document.querySelectorAll<HTMLElement>("[data-scrub-words] .w").forEach((w) => (w.style.opacity = ""));
        smoother?.kill();
        window.__smoother = null;
      };
    }
  );

  return () => {
    mm.revert();
    document.documentElement.dataset.st = String(ScrollTrigger.getAll().length);
  };
}
