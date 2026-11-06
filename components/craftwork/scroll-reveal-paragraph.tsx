"use client";
// Scroll reveal paragraph, from craftwork.design/components/smooth-ui/scroll-reveal-paragraph
// Source: Smooth UI by Eduardo Calvo (github.com/educlopez/smoothui), MIT licence. Same anatomy and motion: each
// word owns an equal slice of the paragraph's scroll progress (motion's useScroll on native scroll, offset
// "start 0.9" to "start 0.25") and brightens from a faint ghost of itself to full colour as you read down.
// Changed for the site:
// - the whole sentence is read once by screen readers (sr-only) and the word spans are aria-hidden, as the
//   site's Split does; the original read every word twice (ghost and overlay);
// - server HTML renders every word at full colour (the progress starts at 1), so the text reads without
//   JavaScript; on mount the real progress is measured before the first scroll, so nothing flashes;
// - words are joined by real spaces (copying the text keeps them) instead of a fixed right margin;
// - the ghost stays in flow under reduced motion: the original rendered only the absolutely placed overlay
//   then, which collapsed every word onto the first;
// - colours inherit the paragraph's own token (a lede is ink-2) instead of the theme foreground; the ghost is
//   that colour at 18% rather than 10%, so waiting words stay legible as secondary text.
import { type MotionValue, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Fragment, type HTMLAttributes, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const KEY_PREFIX_LENGTH = 3;
// the offset below ["start 0.9", "start 0.25"], as viewport fractions, for the first measurement
const START = 0.9;
const END = 0.25;

export interface ScrollRevealParagraphProps extends Omit<HTMLAttributes<HTMLParagraphElement>, "children"> {
  className?: string;
  paragraph: string;
}

export default function ScrollRevealParagraph({ paragraph, className = "text-lg leading-relaxed", ...rest }: ScrollRevealParagraphProps) {
  const container = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ offset: ["start 0.9", "start 0.25"], target: container });
  // full colour in the server HTML; the measured value replaces it before the hydrated page paints
  const progress = useMotionValue(1);
  useMotionValueEvent(scrollYProgress, "change", (v) => progress.set(v));
  useLayoutEffect(() => {
    const el = container.current;
    if (!el) return;
    const vh = window.innerHeight;
    const p = (START * vh - el.getBoundingClientRect().top) / ((START - END) * vh);
    progress.set(Math.min(1, Math.max(0, p)));
  }, [progress]);

  const words = paragraph.split(" ");

  return (
    <p className={cn(className)} ref={container} {...rest}>
      <span className="sr-only">{paragraph}</span>
      <span aria-hidden="true">
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          return (
            <Fragment key={`word-${i}-${word.slice(0, KEY_PREFIX_LENGTH)}`}>
              <Word progress={progress} range={[start, end]}>
                {word}
              </Word>
              {i < words.length - 1 ? " " : null}
            </Fragment>
          );
        })}
      </span>
    </p>
  );
}

interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word = ({ children, progress, range }: WordProps) => {
  const shouldReduceMotion = useReducedMotion();
  const opacity = useTransform(progress, range, shouldReduceMotion ? [1, 1] : [0, 1]);

  return (
    <span className="relative inline-block">
      <span className="text-current/[0.18]">{children}</span>
      <motion.span className="absolute inset-0" style={{ opacity }}>
        {children}
      </motion.span>
    </span>
  );
};
