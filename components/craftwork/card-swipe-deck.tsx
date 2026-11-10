"use client";
// Card swipe deck, from craftwork.design/components/smooth-ui/card-swipe-deck
// Source: Smooth UI by Eduardo Calvo (github.com/educlopez/smoothui), MIT licence. Same anatomy and physics:
// a stack of receding cards (scale and offset per slot, one extra mounted so the depth holds while the top
// card flies); the front card drags with elastic vertical give, tilts around a pivot below its bottom edge,
// tints toward the outcome and blooms a stamp in the opposite top corner as the drag grows; past the
// distance or speed threshold it is thrown along the finger's trajectory and fades, otherwise it springs
// back; arrow keys and Enter on the deck, and an imperative handle (swipeLeft, swipeRight, reset).
// Changed for VISTASY: each card may carry its own stamp text and tone (the product's verdict, so the stamp
// says what the check found, whichever way it is thrown) and can be stamped without a drag (`revealed`, for
// the Check button); the cards behind the front one are inert; keys are read only on the deck itself, so a
// button inside a card does not also throw it; the empty slot and the live announcement come from the
// caller instead of the fixed English copy; the deck keeps the site's focus ring (the original removed the
// outline); stamps are set in sentence case at a smaller size with a softer turn so a verdict fits a card
// in the collage; colours, radius and shadow are our tokens (c-card).
import { animate, m, type PanInfo, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { type KeyboardEvent, type ReactNode, type Ref, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_THRESHOLD = 110; // px of horizontal drag needed to commit
const DEFAULT_ROTATION_FACTOR = 18; // deg at the edge of DRAG_RANGE
const DEFAULT_STACK_SIZE = 3;
const DEFAULT_STACK_OFFSET = 14; // px per receding card
const STACK_SCALE_STEP = 0.05;
const DRAG_RANGE = 260; // px input domain for the rotation transform
const VELOCITY_COMMIT_THRESHOLD = 450; // px/s
const EXIT_DISTANCE = 900; // px travelled before unmount
const STAMP_RATIO = 0.85; // stamps hit full strength just before the threshold
const WASH_RATIO = 1.35; // the colour wash lags the stamps slightly
const WASH_MAX_OPACITY = 0.9;
const REVEAL_WASH_OPACITY = 0.35; // a stamped card (no drag) keeps a light tint of its outcome
const MIN_THROW_SPEED = 750; // px/s floor so button swipes still fly
const THROW_DURATION = 0.34;
const FADE_DELAY = 0.2;
const FADE_DURATION = 0.14;
const VERTICAL_LIMIT = 90; // px of vertical give while dragging
const STAMP_MIN_SCALE = 0.7;
const STAMP_TURN = 12; // deg (the original turns its one-word stamps 20deg)
const DEFAULT_THROW_LIFT = -160; // px/s upward bias for non-drag commits
// the rotation pivot sits below the bottom edge, so the card swings around a point near the hand
const PIVOT_ORIGIN = "50% 165%";
const THROW_TRANSITION = { bounce: 0, duration: THROW_DURATION, type: "spring" as const };
const SNAP_BACK_TRANSITION = { bounce: 0.3, duration: 0.45, type: "spring" as const };
const STACK_TRANSITION = { bounce: 0.1, duration: 0.25, type: "spring" as const };
const FADE_EASE = [0.645, 0.045, 0.355, 1] as const;

export type SwipeDirection = "left" | "right";

export interface CardSwipeDeckLabels {
  left?: string;
  right?: string;
}

export interface CardSwipeDeckItem {
  content: ReactNode;
  id: string;
  /** Stamp copy for this card; falls back to the deck's labels. */
  labels?: CardSwipeDeckLabels;
  /** CSS colour of this card's stamps and wash, e.g. "var(--good)". */
  tone?: string;
  /** Stamp the card (right-hand stamp, full strength) without a drag. */
  revealed?: boolean;
}

export interface CardSwipeDeckHandle {
  /** Moves focus to the deck when it is inside the deck (a control there is about to disappear). */
  keepFocus: () => void;
  reset: () => void;
  swipeLeft: () => void;
  swipeRight: () => void;
}

export interface CardSwipeDeckProps {
  className?: string;
  disabled?: boolean;
  items: CardSwipeDeckItem[];
  labels?: CardSwipeDeckLabels;
  /** Accessible name of the deck. */
  label: string;
  /** Text for the polite live region (what just happened). */
  announce?: string;
  /** Shown in the deck's place once every card has gone. */
  empty?: ReactNode;
  onEmpty?: () => void;
  onSwipe?: (id: string, direction: SwipeDirection) => void;
  ref?: Ref<CardSwipeDeckHandle>;
  rotationFactor?: number;
  stackOffset?: number;
  stackSize?: number;
  threshold?: number;
}

interface ThrowVector {
  direction: SwipeDirection;
  vx: number;
  vy: number;
}

interface DeckCardProps {
  disabled: boolean;
  isFront: boolean;
  item: CardSwipeDeckItem;
  labels: Required<CardSwipeDeckLabels>;
  onCommit: (direction: SwipeDirection, info?: PanInfo) => void;
  onExitComplete: () => void;
  pos: number;
  rotationFactor: number;
  shouldReduceMotion: boolean;
  stackOffset: number;
  stackSize: number;
  threshold: number;
  throwVector: ThrowVector | null;
  zIndex: number;
}

const DeckCard = ({ disabled, isFront, item, labels, onCommit, onExitComplete, pos, rotationFactor, shouldReduceMotion, stackOffset, stackSize, threshold, throwVector, zIndex }: DeckCardProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const reveal = useMotionValue(0);
  const isExiting = throwVector !== null;
  const tone = item.tone ?? "var(--ink-3)";
  const ink = `color-mix(in srgb, ${tone} 80%, var(--ink))`;

  const rotate = useTransform(x, [-DRAG_RANGE, DRAG_RANGE], [-rotationFactor, rotationFactor]);

  const stampSpan = threshold * STAMP_RATIO;
  const washSpan = threshold * WASH_RATIO;

  // stamps and wash are driven straight off the drag distance (or the reveal), so they bloom continuously
  // under the finger instead of snapping in at the threshold
  const likeOpacity = useTransform([x, reveal], ([vx, r]: number[]) => Math.max(Math.min(Math.max(vx / stampSpan, 0), 1), r));
  const likeScale = useTransform(likeOpacity, [0, 1], [STAMP_MIN_SCALE, 1]);
  const nopeOpacity = useTransform(x, [-stampSpan, 0], [1, 0]);
  const nopeScale = useTransform(x, [-stampSpan, 0], [1, STAMP_MIN_SCALE]);
  const likeWash = useTransform([x, reveal], ([vx, r]: number[]) => Math.max(Math.min(Math.max(vx / washSpan, 0), 1) * WASH_MAX_OPACITY, r * REVEAL_WASH_OPACITY));
  const nopeWash = useTransform(x, [-washSpan, 0], [WASH_MAX_OPACITY, 0]);

  useEffect(() => {
    const to = item.revealed ? 1 : 0;
    if (shouldReduceMotion) {
      reveal.set(to);
      return;
    }
    const c = animate(reveal, to, { type: "spring", bounce: 0.2, duration: 0.35 });
    return () => c.stop();
  }, [item.revealed, reveal, shouldReduceMotion]);

  useEffect(() => {
    if (!throwVector || shouldReduceMotion) return;
    const targetX = throwVector.direction === "left" ? -EXIT_DISTANCE : EXIT_DISTANCE;
    const speed = Math.max(Math.abs(throwVector.vx), MIN_THROW_SPEED);
    const signedVx = throwVector.direction === "left" ? -speed : speed;
    // keep the throw on the trajectory the finger was already describing
    const targetY = y.get() + throwVector.vy * THROW_DURATION;
    const xControls = animate(x, targetX, { ...THROW_TRANSITION, velocity: signedVx });
    const yControls = animate(y, targetY, { ...THROW_TRANSITION, velocity: throwVector.vy });
    return () => {
      xControls.stop();
      yControls.stop();
    };
  }, [throwVector, shouldReduceMotion, x, y]);

  const handleDragEnd = useCallback(
    (_event: unknown, info: PanInfo) => {
      if (disabled) return;
      const shouldCommit = Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > VELOCITY_COMMIT_THRESHOLD;
      if (shouldCommit) {
        onCommit(info.offset.x > 0 ? "right" : "left", info);
        return;
      }
      // below threshold: elastic snap back to centre
      animate(x, 0, SNAP_BACK_TRANSITION);
      animate(y, 0, SNAP_BACK_TRANSITION);
    },
    [disabled, onCommit, threshold, x, y]
  );

  const isBuried = pos >= stackSize;
  const canDrag = isFront && !disabled && !isExiting;
  const stamp = "pointer-events-none absolute top-5 whitespace-nowrap rounded-[10px] border-2 px-2.5 py-1 text-[0.9375rem] font-semibold leading-none";

  return (
    <m.div
      animate={{ scale: 1 - pos * STACK_SCALE_STEP, y: pos * stackOffset }}
      className="absolute inset-0"
      initial={false}
      style={{ zIndex }}
      transition={shouldReduceMotion ? { duration: 0 } : STACK_TRANSITION}
    >
      <m.div
        animate={
          isExiting
            ? { opacity: 0, transition: shouldReduceMotion ? { duration: 0 } : { delay: FADE_DELAY, duration: FADE_DURATION, ease: FADE_EASE } }
            : { opacity: isBuried ? 0 : 1 }
        }
        className={cn("c-card relative h-full w-full overflow-hidden", canDrag && "cursor-grab active:cursor-grabbing")}
        drag={canDrag}
        initial={false}
        dragConstraints={{ bottom: VERTICAL_LIMIT, top: -VERTICAL_LIMIT }}
        dragElastic={{ bottom: 0.35, left: 1, right: 1, top: 0.35 }}
        dragMomentum={false}
        inert={!isFront || isExiting}
        onAnimationComplete={() => {
          if (isExiting) onExitComplete();
        }}
        onDragEnd={handleDragEnd}
        style={{ rotate, transformOrigin: PIVOT_ORIGIN, x, y }}
        transition={shouldReduceMotion ? { duration: 0 } : STACK_TRANSITION}
        whileDrag={shouldReduceMotion ? undefined : { scale: 1.02 }}
      >
        {item.content}

        {/* kept mounted through the throw so the stamp flies off with the card */}
        {isFront ? (
          <>
            {/* colour wash: the card itself tints toward the outcome */}
            <m.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ opacity: likeWash, background: `linear-gradient(to left, color-mix(in srgb, ${tone} 30%, transparent), color-mix(in srgb, ${tone} 8%, transparent), transparent)` }}
            />
            <m.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ opacity: nopeWash, background: `linear-gradient(to right, color-mix(in srgb, ${tone} 30%, transparent), color-mix(in srgb, ${tone} 8%, transparent), transparent)` }}
            />
            {/* stamps: outlined, turned, driven by drag distance */}
            <m.div aria-hidden="true" className={cn(stamp, "left-5")} style={{ opacity: likeOpacity, rotate: -STAMP_TURN, scale: likeScale, color: ink, borderColor: ink, background: "color-mix(in srgb, var(--sheet) 86%, transparent)" }}>
              {item.labels?.right ?? labels.right}
            </m.div>
            <m.div aria-hidden="true" className={cn(stamp, "right-5")} style={{ opacity: nopeOpacity, rotate: STAMP_TURN, scale: nopeScale, color: ink, borderColor: ink, background: "color-mix(in srgb, var(--sheet) 86%, transparent)" }}>
              {item.labels?.left ?? labels.left}
            </m.div>
          </>
        ) : null}
      </m.div>
    </m.div>
  );
};

export function CardSwipeDeck({
  className,
  disabled = false,
  items,
  labels,
  label,
  announce,
  empty,
  onEmpty,
  onSwipe,
  ref,
  rotationFactor = DEFAULT_ROTATION_FACTOR,
  stackOffset = DEFAULT_STACK_OFFSET,
  stackSize = DEFAULT_STACK_SIZE,
  threshold = DEFAULT_THRESHOLD,
}: CardSwipeDeckProps) {
  const shouldReduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [exiting, setExiting] = useState<{ id: string; vector: ThrowVector } | null>(null);

  const remaining = items.filter((item) => !removedIds.has(item.id));
  // one extra card is mounted so the stack keeps its depth while the top card is flying away
  const visible = remaining.slice(0, stackSize + 1);

  const commitSwipe = useCallback(
    (direction: SwipeDirection, info?: PanInfo) => {
      if (disabled || exiting) return;
      const [top] = remaining;
      if (!top) return;
      onSwipe?.(top.id, direction);
      const wasLast = remaining.length === 1;
      if (shouldReduceMotion) setRemovedIds((prev) => new Set(prev).add(top.id));
      else setExiting({ id: top.id, vector: { direction, vx: info?.velocity.x ?? 0, vy: info?.velocity.y ?? DEFAULT_THROW_LIFT } });
      if (wasLast) onEmpty?.();
    },
    [disabled, exiting, onEmpty, onSwipe, remaining, shouldReduceMotion]
  );

  const handleExitComplete = useCallback((id: string) => {
    setRemovedIds((prev) => new Set(prev).add(id));
    setExiting(null);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      keepFocus: () => {
        const root = rootRef.current;
        if (root && root !== document.activeElement && root.contains(document.activeElement)) root.focus({ preventScroll: true });
      },
      reset: () => {
        setRemovedIds(new Set());
        setExiting(null);
      },
      swipeLeft: () => commitSwipe("left"),
      swipeRight: () => commitSwipe("right"),
    }),
    [commitSwipe]
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // only the deck itself: a button inside a card handles its own Enter
    if (disabled || event.target !== event.currentTarget) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      commitSwipe("left");
    } else if (event.key === "ArrowRight" || event.key === "Enter") {
      event.preventDefault();
      commitSwipe("right");
    }
  };

  const resolvedLabels: Required<CardSwipeDeckLabels> = { left: labels?.left ?? "", right: labels?.right ?? "" };

  return (
    <div ref={rootRef} aria-label={label} className={cn("relative touch-pan-y rounded-[30px]", className)} onKeyDown={handleKeyDown} role="application" tabIndex={visible.length ? 0 : -1}>
      {visible.length === 0
        ? empty
        : visible.map((item, index) => {
            const isExitingCard = exiting?.id === item.id;
            // while the top card leaves, everything behind it slides forward one slot
            const pos = exiting ? Math.max(index - 1, 0) : index;
            return (
              <DeckCard
                disabled={disabled}
                isFront={index === 0}
                item={item}
                key={item.id}
                labels={resolvedLabels}
                onCommit={commitSwipe}
                onExitComplete={() => handleExitComplete(item.id)}
                pos={isExitingCard ? 0 : pos}
                rotationFactor={rotationFactor}
                shouldReduceMotion={Boolean(shouldReduceMotion)}
                stackOffset={stackOffset}
                stackSize={stackSize}
                threshold={threshold}
                throwVector={isExitingCard ? exiting.vector : null}
                zIndex={visible.length - index}
              />
            );
          })}
      <div aria-live="polite" className="sr-only">
        {announce}
      </div>
    </div>
  );
}
