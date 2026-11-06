"use client";
import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap-client";
import { VerdictBand } from "@/components/verdict";
import { Icon } from "@/components/icon";
import { Safari, SAFARI_RADIUS } from "@/components/craftwork/safari";

export type WidgetStageStrings = {
  caption: string;
  brand: string;
  product: string;
  meta: string;
  verdict: string;
  verdictText: string;
  note: string;
  read: string;
  reading: string;
  of100: string;
  /** "{lo}" and "{hi}" are replaced */
  range: string;
  faceAlt: string;
};

/** the sample reading behind the verdict: the median of three reads and the lowest and highest of them */
export type WidgetSample = { value: number; lo: number; hi: number };

// The retailers hero object, built as two layers on one stage (visual anchoring):
// - back: the shopper's product page, the store's own (neutral bars stand in for its header, price,
//   buy button and description, so nothing about the store is invented), open in a browser window (Magic
//   UI's Safari, components/craftwork/safari.tsx) resting at .s2. The page inside is laid out in container
//   units, so it scales with the window like a screenshot would, and the window shows its top, as a
//   browser does; the widget lands over the part below the product;
// - front: the VISTASY widget, the read and its verdict, one step up at .s4, landing over the lower part
//   of the page (where its description would be), never over the product itself.
// ScrollSmoother depth sits on wrappers only: the plane drifts slower (0.9), the page a little slower,
// the widget faster and trailing (1.1, lag), while the contact shadow stays on the page, so the widget
// visibly lifts off the page as you scroll. The whole object leans toward a fine pointer (beui tilt-card
// anatomy). No resting Z offset: a perspective-scaled layer would blur the widget's small type.
// Intro (one hero moment): the page sets down, the widget rises in front of it, a scan passes over the
// selfie, the reading fills and counts, then the verdict lands. Opacity and transform only; reduced
// motion and no JavaScript show the final state. Values are the labelled sample used on the home page.
export function WidgetStage({ s, sample }: { s: WidgetStageStrings; sample: WidgetSample }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const html = document.documentElement;
      if (prefersReducedMotion() || html.classList.contains("motion-fallback")) {
        html.classList.add("motion-ok");
        return;
      }
      const q = gsap.utils.selector(root);
      const page = q("[data-ws-page]");
      const widget = q("[data-ws-widget]");
      const scan = q(".rs-scan");
      const bar = q(".meter i");
      const count = q("[data-count]");
      const verdict = q(".verdict-band");
      const note = q("[data-ws-note]");

      gsap.set(page, { opacity: 0, y: 26 });
      gsap.set(widget, { opacity: 0, y: 44, scale: 0.965 });
      gsap.set(bar, { scaleX: 0 });
      gsap.set([...verdict, ...note], { opacity: 0, y: 8 });
      html.classList.add("motion-ok");

      const read = gsap
        .timeline({ defaults: { ease: "settle" }, paused: true })
        .to(page, { opacity: 1, y: 0, duration: 0.8, clearProps: "transform" }, 0)
        .to(widget, { opacity: 1, y: 0, scale: 1, duration: 0.95, clearProps: "transform" }, 0.28)
        .set(scan, { y: 0, opacity: 0 }, 0.62)
        .to(scan, { keyframes: [{ opacity: 1, duration: 0.12 }, { y: 38, duration: 0.7, ease: "power1.inOut" }, { opacity: 0, duration: 0.2 }] }, 0.62)
        .to(bar, { scaleX: sample.value / 100, duration: 0.9 }, 0.78)
        .from(count, { textContent: 0, snap: { textContent: 1 }, duration: 0.9, ease: "power2.out" }, 0.78)
        .to(verdict, { opacity: 1, y: 0, duration: 0.56, clearProps: "transform" }, 1.18)
        .to(note, { opacity: 1, y: 0, duration: 0.44, clearProps: "transform" }, 1.36);

      // wide screens: the object sits beside the headline, so it plays once the message has landed;
      // narrow screens: it sits below the fold, so it plays when it scrolls into view
      if (window.matchMedia("(min-width: 1024px)").matches) {
        gsap.delayedCall(0.25, () => {
          read.play();
        });
        return;
      }
      // the whole object, so the page layer above the widget never waits blank in view
      const target = root.current;
      if (!target) return void read.progress(1);
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            read.play();
            io.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      io.observe(target);
      return () => io.disconnect();
    },
    { scope: root }
  );

  const range = s.range.replace("{lo}", String(sample.lo)).replace("{hi}", String(sample.hi));

  return (
    <div ref={root} className="rt-ws stage tilt-scene">
      <span aria-hidden="true" className="stage-plane rt-plane-hero" data-speed="clamp(0.9)" />
      <span aria-hidden="true" className="contact-shadow" style={{ bottom: "-30px" }} />
      <div className="rt-ws-tilt" data-tilt="3">
        {/* back layer: the store's own product page */}
        <div className="rt-ws-back" data-speed="clamp(0.96)">
          <Safari className="rt-ws-page s2" style={{ borderRadius: SAFARI_RADIUS }} screenClassName="rt-sf-screen" data-hero-sheet="" data-ws-page="">
            <div className="rt-ws-bar" aria-hidden="true">
              <span className="rt-sk rt-sf-logo" />
              <span className="rt-sk rt-sf-link ml-[2%]" />
              <span className="rt-sk rt-sf-link" />
              <span className="rt-sk rt-sf-link" />
              <Icon name="i-shopping-bag" className="ico rt-sf-bag ml-auto text-ink-4" />
            </div>
            <div className="rt-sf-body">
              <span className="rt-ws-shot">
                <Image src="/products/azelaic-acid-10-booster.png" alt="" width={220} height={220} priority sizes="(min-width: 1024px) 140px, 30vw" />
              </span>
              <div className="min-w-0">
                <p className="rt-sf-small text-ink-3">{s.brand}</p>
                <p className="rt-sf-name font-medium">{s.product}</p>
                <p className="rt-sf-small text-ink-3">{s.meta}</p>
                <span aria-hidden="true" className="rt-sk rt-sf-price" />
                <span aria-hidden="true" className="rt-sk rt-sf-buy" />
              </div>
            </div>
            {/* the rest of the store's page (description, reviews): the widget lands over this part */}
            <div className="rt-ws-more" aria-hidden="true">
              <span className="rt-sk w-full" />
              <span className="rt-sk w-11/12" />
              <span className="rt-sk w-3/5" />
            </div>
          </Safari>
        </div>

        {/* front layer: the VISTASY widget, the read and its verdict */}
        <div className="rt-ws-front" data-speed="clamp(1.1)" data-lag="0.1">
          <figure className="rt-ws-widget s4" data-hero-sheet="" data-ws-widget="">
            <figcaption className="flex items-center gap-2 text-micro font-medium text-ink-3">
              <Icon name="i-shopping-bag" className="ico h-4 w-4" />
              {s.caption}
            </figcaption>
            <div className="mt-3 flex items-center gap-3">
              <div className="rs-face rt-ws-face">
                <Image src="/read/sample-face.png" alt={s.faceAlt} width={44} height={44} />
                <span className="rs-scan" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-micro text-ink-3">{s.read}</p>
                <div className="reading rt-ws-reading">
                  <span className="name">{s.reading}</span>
                  <span className="val">
                    <span data-count="">{sample.value}</span>
                    <small>{s.of100}</small>
                  </span>
                  <span className="sr-only">{range}</span>
                  <span className="meter" style={{ "--v": sample.value / 100, "--lo": sample.lo / 100, "--hi": sample.hi / 100 } as React.CSSProperties}>
                    <i />
                    <b />
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <VerdictBand kind="fits" title={s.verdict} text={s.verdictText} />
            </div>
            <p className="mt-3 text-micro text-ink-3" data-ws-note="">
              {s.note}
            </p>
          </figure>
        </div>
      </div>
    </div>
  );
}
