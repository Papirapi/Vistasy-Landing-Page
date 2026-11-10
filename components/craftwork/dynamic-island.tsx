"use client";
// Dynamic Island, from craftwork.design/components/smooth-ui/dynamic-island
// Source: Smooth UI by Eduardo Calvo (github.com/educlopez/smoothui), MIT licence. The island is the
// original: one pill with a spring layout animation whose bounce depends on the pair of views it moves
// between, and each view's content arriving from blur(5px), scale 0.9 and opacity 0. Ported changes: the
// views are passed in (`views`, keyed by name, "idle" required) instead of the demo's weather, call, timer,
// notification and music cards and their switcher bar; the pair-of-views bounce table is a prop and is
// also worked out when the view is controlled from outside; the pill takes the camera ink (--cam-island)
// instead of pure black; the first view is server-rendered in place, and under reduced motion views swap
// without the entrance.
import { m, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_BOUNCE = 0.5;

export interface DynamicIslandProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Content for each view; "idle" is the resting pill */
  views: { idle: ReactNode } & Record<string, ReactNode>;
  /** The view on show (controlled) */
  view?: string;
  /** Spring bounce per "from-to" pair of views, as in the original's BOUNCE_VARIANTS */
  bounce?: Record<string, number>;
  /** Classes for the pill itself */
  islandClassName?: string;
}

export function DynamicIsland({ views, view = "idle", bounce = {}, className, islandClassName, ...props }: DynamicIslandProps) {
  const shouldReduceMotion = useReducedMotion();
  // the pair of views being moved between picks the spring's bounce (the original tracks it on click;
  // here it is derived during render so a view set from outside gets the same spring)
  const [pair, setPair] = useState({ from: view, to: view });
  if (pair.to !== view) setPair({ from: pair.to, to: view });
  const variantKey = pair.from === pair.to ? view : `${pair.from}-${pair.to}`;
  const springBounce = bounce[variantKey] ?? DEFAULT_BOUNCE;
  const content = views[view] ?? views.idle;
  // the view on first paint is already in place (server HTML shows it); later views make the entrance
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
  }, []);

  return (
    <div className={cn("flex justify-center", className)} {...props}>
      <m.div
        className={cn("mx-auto w-fit min-w-[100px] overflow-hidden rounded-full bg-[var(--cam-island)] text-white", islandClassName)}
        layout
        style={{ borderRadius: 32 }}
        transition={shouldReduceMotion ? { duration: 0 } : { bounce: springBounce, duration: 0.25, type: "spring" as const }}
      >
        <m.div
          animate={
            shouldReduceMotion
              ? { opacity: 1, scale: 1 }
              : {
                  filter: "blur(0px)",
                  opacity: 1,
                  originX: 0.5,
                  originY: 0.5,
                  scale: 1,
                  transition: { delay: 0.05 },
                }
          }
          initial={
            shouldReduceMotion || !mounted.current
              ? false
              : {
                  filter: "blur(5px)",
                  opacity: 0,
                  originX: 0.5,
                  originY: 0.5,
                  scale: 0.9,
                }
          }
          key={view}
          transition={{ bounce: springBounce, type: "spring" as const }}
        >
          {content}
        </m.div>
      </m.div>
    </div>
  );
}
