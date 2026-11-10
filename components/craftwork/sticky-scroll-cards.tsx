"use client";
// Sticky scroll cards, from craftwork.design/components/componentry/sticky-scroll-cards
// Source: componentry by Harsh Jadhav (github.com/harshjdhv/componentry), MIT licence. Same anatomy and motion:
// every card sits in its own sticky slot, framed like a print (a plate above a caption strip), tilted by the
// same pattern and stepped 22px lower than the one before; as the list scrolls, the cards below settle back
// (scale from the top edge, to the original resting scales) while the next one slides over them, and the whole
// stack lets go together when the last card lands.
// Changed for the site:
// - no Lenis: the site has its own scroller. With native scroll (touch, reduced motion) the slots are plain CSS
//   sticky and the scale reads motion's useScroll, as in the original. Under GSAP ScrollSmoother, CSS sticky is
//   inert (the content is moved by a transform inside a fixed wrapper), so while the smoother runs the same
//   sticky rule is applied as a translate, computed from the smoother's own scroll position on GSAP's ticker
//   (it runs after the smoother has moved the content, in the same frame, so nothing trails), and the scale
//   reads that position too;
// - each card's plate holds content (an icon, a sentence, product UI) instead of a photo; the caption is a
//   sentence-case label in ink-3 rather than 11px grey capitals;
// - slots sit under the fixed header and are shorter than a full screen (CSS block `craftwork: sticky scroll
//   cards`); the step offsets are centred on the slot instead of the demo's -5vh + 160px;
// - colours and depth from the site tokens (sheet, stage plate, --e3 shadow); the "scroll to explore" hint is
//   dropped (the site does not use scroll cues).
import { m, type MotionValue, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { type ReactNode, type RefObject, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

export interface StickyScrollCardItem {
  /** caption under the plate (the original's card title) */
  title: string;
  /** what the plate shows (the original's image) */
  content: ReactNode;
}

interface StickyScrollCardsProps {
  cards: StickyScrollCardItem[];
  /** Additional CSS classes for the list */
  className?: string;
}

const TILT_PATTERN = [-1.25, 0.85, -0.65, 1.35, -0.9];
const STEP_PX = 22;

function StackCard({
  card,
  index,
  total,
  progress,
  reduceMotion,
  slotRef,
}: {
  card: StickyScrollCardItem;
  index: number;
  total: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
  slotRef: (el: HTMLLIElement | null) => void;
}) {
  const start = total > 1 ? index / (total + 1) : 0;
  const restingScale = Math.max(0.56, 1 - (total - index - 1) * 0.095);
  const scale = useTransform(progress, [start, 1], reduceMotion ? [1, 1] : [1, restingScale]);

  return (
    <li ref={slotRef} className="cw-stack-slot grid w-full place-items-center">
      <m.figure
        className="relative m-0 origin-top overflow-hidden rounded-[var(--r-sheet)] bg-sheet text-ink shadow-[var(--edge),var(--e3)]"
        style={{
          scale,
          rotate: reduceMotion ? 0 : TILT_PATTERN[index % TILT_PATTERN.length],
          top: `${(index - (total - 1) / 2) * STEP_PX}px`,
        }}
      >
        <div className="p-2 pb-0">
          <div className="cw-stack-plate flex min-h-[clamp(250px,24vw,292px)] w-[min(82vw,500px)] flex-col rounded-[var(--r-label)] p-6 sm:p-7">{card.content}</div>
        </div>
        <figcaption className="grid min-h-11 place-items-center px-4 py-2.5 text-center text-micro font-medium text-ink-3">{card.title}</figcaption>
      </m.figure>
    </li>
  );
}

// CSS sticky under ScrollSmoother: the same rule (stick at the slot's `top`, never past the list's end),
// applied as a translate from the smoother's scroll position. Runs only while the list is near the viewport.
function useSmootherSticky(list: RefObject<HTMLUListElement | null>, slots: RefObject<(HTMLLIElement | null)[]>, progress: MotionValue<number>, emulating: RefObject<boolean>) {
  useEffect(() => {
    const ul = list.current;
    if (!ul) return;
    let listening = false;
    let stick = -1;
    const clear = () => slots.current.forEach((el) => el && (el.style.transform = ""));
    const tick = () => {
      const sm = window.__smoother;
      if (!sm) {
        if (emulating.current) {
          emulating.current = false;
          clear();
        }
        return;
      }
      emulating.current = true;
      const els = slots.current.filter((el): el is HTMLLIElement => !!el);
      if (!els.length) return;
      if (stick < 0) stick = parseFloat(getComputedStyle(els[0]).top) || 0;
      const s = sm.scrollTop();
      const top = ul.getBoundingClientRect().top + s; // the content is translated by -s
      const H = ul.offsetHeight;
      progress.set(Math.min(1, Math.max(0, (s - top) / Math.max(1, H - window.innerHeight))));
      for (const el of els) {
        const o = el.offsetTop;
        const y = Math.min(Math.max(s + stick - (top + o), 0), Math.max(0, H - (o + el.offsetHeight)));
        el.style.transform = y > 0 ? `translate3d(0, ${y}px, 0)` : "";
      }
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !listening) {
          gsap.ticker.add(tick);
          listening = true;
          tick();
        } else if (!e.isIntersecting && listening) {
          gsap.ticker.remove(tick);
          listening = false;
        }
      },
      { rootMargin: "50% 0px" }
    );
    io.observe(ul);
    const onResize = () => (stick = -1);
    window.addEventListener("resize", onResize);
    return () => {
      io.disconnect();
      if (listening) gsap.ticker.remove(tick);
      window.removeEventListener("resize", onResize);
      emulating.current = false;
      clear();
    };
  }, [list, slots, progress, emulating]);
}

export function StickyScrollCards({ cards, className }: StickyScrollCardsProps) {
  const container = useRef<HTMLUListElement>(null);
  const slots = useRef<(HTMLLIElement | null)[]>([]);
  const emulating = useRef(false);
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: container, offset: ["start start", "end end"] });
  const progress = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!emulating.current) progress.set(v);
  });
  useSmootherSticky(container, slots, progress, emulating);

  return (
    <ul ref={container} className={cn("cw-stack relative flex w-full flex-col items-center", className)}>
      {cards.map((card, index) => (
        <StackCard
          key={`${card.title}-${index}`}
          card={card}
          index={index}
          total={cards.length}
          progress={progress}
          reduceMotion={reduceMotion}
          slotRef={(el) => {
            slots.current[index] = el;
          }}
        />
      ))}
    </ul>
  );
}
