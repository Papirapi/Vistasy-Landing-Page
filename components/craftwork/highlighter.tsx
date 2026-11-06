"use client";
// Highlighter, from craftwork.design/components/magicui/highlighter
// Source: Magic UI by Dillion Verma (github.com/magicuidesign/magicui), MIT licence. Same anatomy and behaviour:
// rough-notation draws a hand-made mark (highlight by default) over the words, once, when they scroll into view
// (motion's useInView, margin -10%), and redraws without animation when the text reflows.
// Changed: the colour comes from the site tokens (lavender under ink in light mode, a deep violet under light
// ink in dark mode, see `craftwork: highlighter` in globals.css) instead of a fixed pink; reduced motion shows
// the mark without the drawing; the words sit in a wrapper span so rough-notation's SVG lands in an element
// React does not reconcile. HighlightPhrase is a VISTASY helper that marks one phrase inside a message.
import { useInView, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { annotate } from "rough-notation";
import type { RoughAnnotation } from "rough-notation/lib/model";
import { cn } from "@/lib/utils";

type AnnotationAction = "highlight" | "underline" | "box" | "circle" | "strike-through" | "crossed-off" | "bracket";

export interface HighlighterProps {
  children: ReactNode;
  action?: AnnotationAction;
  /** Any CSS colour; the default follows the theme through --cw-hl. */
  color?: string;
  strokeWidth?: number;
  animationDuration?: number;
  iterations?: number;
  padding?: number;
  multiline?: boolean;
  isView?: boolean;
  className?: string;
}

export function Highlighter({
  children,
  action = "highlight",
  color = "currentColor",
  strokeWidth = 1.5,
  animationDuration = 600,
  iterations = 2,
  padding = 2,
  multiline = true,
  isView = false,
  className,
}: HighlighterProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  const isInView = useInView(elementRef, { once: true, margin: "-10%" });

  // If isView is false, always show. If isView is true, wait for inView
  const shouldShow = !isView || isInView;

  useLayoutEffect(() => {
    const element = elementRef.current;
    let annotation: RoughAnnotation | null = null;
    let resizeObserver: ResizeObserver | null = null;

    if (shouldShow && element) {
      const currentAnnotation = annotate(element, {
        type: action,
        color,
        strokeWidth,
        animationDuration,
        iterations,
        padding,
        multiline,
        animate: !reduce,
      });
      annotation = currentAnnotation;
      currentAnnotation.show();

      resizeObserver = new ResizeObserver(() => {
        currentAnnotation.hide();
        currentAnnotation.show();
      });

      resizeObserver.observe(element);
      resizeObserver.observe(document.body);
    }

    return () => {
      annotation?.remove();
      resizeObserver?.disconnect();
    };
  }, [shouldShow, action, color, strokeWidth, animationDuration, iterations, padding, multiline, reduce]);

  return (
    <span className={cn("cw-hl relative", className)}>
      <span ref={elementRef} className="relative inline-block bg-transparent">
        {children}
      </span>
    </span>
  );
}

/** Marks the first occurrence of `phrase` in `text`; if the locale words it differently, the text stays plain. */
export function HighlightPhrase({ text, phrase, ...props }: { text: string; phrase: string } & Omit<HighlighterProps, "children">) {
  const i = phrase ? text.indexOf(phrase) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <Highlighter {...props}>{phrase}</Highlighter>
      {text.slice(i + phrase.length)}
    </>
  );
}
