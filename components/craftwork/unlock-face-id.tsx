"use client";
// Unlock Face ID, from craftwork.design/components/smooth-ui/unlock-face-id
// Source: Smooth UI by Eduardo Calvo (github.com/educlopez/smoothui), MIT licence. The glyph (four corner
// brackets and a schematic face drawn stroke by stroke), the scan band, the spring check, the error shake,
// the status line and the gated content are the original, with its motion tokens. Ported changes: VISTASY
// tokens (violet scan band, good check, flag error; --faceid-good, --faceid-error and --faceid-muted let a
// dark surface pick lighter inks); no default copy (`messages` and `label` come from the site's messages); `face={false}`
// draws the brackets alone, for scanning something that is not a face; `size` also takes a CSS length; the
// busy button is aria-disabled rather than disabled so keyboard focus stays on it; `live="off"` keeps a run
// the reader did not start from being announced; class hooks for the button and the status line; the glyph
// on first paint is drawn in place (it shows without JavaScript), later glyphs draw in as in the original.
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type UnlockStatus = "idle" | "scanning" | "success" | "error";

export type UnlockFaceIdProps = {
  /** Content gated behind the scan, blurred while locked, sharp once unlocked */
  children?: ReactNode;
  /** Additional CSS classes for the root */
  className?: string;
  /** Classes for the trigger button */
  buttonClassName?: string;
  /** Classes for the status line */
  statusClassName?: string;
  /** Status line for each state */
  messages: Record<UnlockStatus, string>;
  /** Accessible label for the scan trigger */
  label: string;
  /** Draw the schematic face inside the brackets */
  face?: boolean;
  /** "off" stops status changes from being announced (a run the reader did not start) */
  live?: "polite" | "off";
  /** Fired when an uncontrolled scan resolves successfully */
  onComplete?: () => void;
  /** Fired whenever the trigger is activated */
  onScan?: () => void;
  /** How long an uncontrolled scan takes, in ms */
  scanDuration?: number;
  /** Rendered size of the glyph, in px or any CSS length */
  size?: number | string;
  /** Controlled status, omit for uncontrolled behaviour */
  status?: UnlockStatus;
};

const DEFAULT_SIZE = 128;
const DEFAULT_SCAN_DURATION = 1800;

/* -------------------------------------------------------------------------- */
/* Motion tokens                                                              */
/* -------------------------------------------------------------------------- */

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const EASE_IN_OUT: [number, number, number, number] = [0.645, 0.045, 0.355, 1];
const INSTANT = { duration: 0 };
const CHECK_SPRING = { bounce: 0.28, duration: 0.4, type: "spring" as const };
const GLYPH_SPRING = { bounce: 0.1, duration: 0.25, type: "spring" as const };
const BRACKET_DRAW = 0.4;
const BRACKET_STAGGER = 0.07;
const FACE_DELAY = 0.26;
const FACE_DRAW = 0.42;
const FACE_STAGGER = 0.07;
const SCAN_SWEEP = 1.5;
const SHAKE_DURATION = 0.4;
const CONTENT_REVEAL = 0.4;
const SHAKE_KEYFRAMES = [0, -7, 7, -5, 5, -2, 0];

/* -------------------------------------------------------------------------- */
/* Geometry: Apple's Face ID mark, four corner brackets and a schematic face   */
/* -------------------------------------------------------------------------- */

const VIEWBOX = 100;
const STROKE_WIDTH = 4;
const CHECK_STROKE_WIDTH = 5;

/** Four corner brackets only, no full outline, with a clear gap between them. */
const BRACKET_PATHS = ["M8 34 L8 28 A20 20 0 0 1 28 8 L34 8", "M66 8 L72 8 A20 20 0 0 1 92 28 L92 34", "M92 66 L92 72 A20 20 0 0 1 72 92 L66 92", "M34 92 L28 92 A20 20 0 0 1 8 72 L8 66"];

/** Two short vertical eye strokes, a nose that turns right at the bottom, and a
 *  shallow smile with small upward ticks at each end. */
const FACE_PATHS = ["M36 38 L36 47", "M64 38 L64 47", "M50 38 L50 54 Q50 57.5 53.5 57.5 L56 57.5", "M36 61 L36 66 Q50 73 64 66 L64 61"];

const CHECK_PATH = "M30 52 L44 66 L72 34";

const SCAN_CLIP = { height: 84, rx: 22, width: 84, x: 8, y: 8 };
const SCAN_BAND_HEIGHT = 18;
const SCAN_TRAVEL = 34;

const GOOD = "var(--faceid-good, var(--good))";
const ERROR = "var(--faceid-error, var(--flag))";
const BRAND = "var(--cross)";

const TEXT_BY_STATUS: Record<UnlockStatus, string> = {
  error: ERROR,
  idle: "var(--faceid-muted, var(--ink-3))",
  scanning: "var(--faceid-muted, var(--ink-3))",
  success: GOOD,
};

const STROKE_BY_STATUS: Record<UnlockStatus, string> = {
  error: ERROR,
  idle: "currentColor",
  scanning: "currentColor",
  success: GOOD,
};

/* -------------------------------------------------------------------------- */
/* Glyph                                                                      */
/* -------------------------------------------------------------------------- */

type FaceGlyphProps = {
  canAnimate: boolean;
  clipId: string;
  face: boolean;
  gradientId: string;
  isScanning: boolean;
  stroke: string;
};

const FaceGlyph = ({ canAnimate, clipId, face, gradientId, isScanning, stroke }: FaceGlyphProps) => (
  <m.g
    animate={{ opacity: 1, scale: 1 }}
    exit={canAnimate ? { opacity: 0, scale: 0.82 } : { opacity: 0, transition: INSTANT }}
    initial={canAnimate ? { opacity: 0, scale: 0.94 } : { opacity: 1, scale: 1 }}
    style={{ transformOrigin: "50px 50px" }}
    transition={canAnimate ? GLYPH_SPRING : INSTANT}
  >
    {BRACKET_PATHS.map((path, index) => (
      <m.path
        animate={{ pathLength: 1 }}
        d={path}
        fill="none"
        initial={canAnimate ? { pathLength: 0 } : { pathLength: 1 }}
        key={path}
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={STROKE_WIDTH}
        transition={canAnimate ? { delay: index * BRACKET_STAGGER, duration: BRACKET_DRAW, ease: EASE_OUT } : INSTANT}
      />
    ))}

    {face &&
      FACE_PATHS.map((path, index) => (
        <m.path
          animate={{ pathLength: 1 }}
          d={path}
          fill="none"
          initial={canAnimate ? { pathLength: 0 } : { pathLength: 1 }}
          key={path}
          stroke={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={STROKE_WIDTH}
          transition={canAnimate ? { delay: FACE_DELAY + index * FACE_STAGGER, duration: FACE_DRAW, ease: EASE_OUT } : INSTANT}
        />
      ))}

    {isScanning && canAnimate ? (
      <g clipPath={`url(#${clipId})`}>
        <m.g
          animate={{ y: SCAN_TRAVEL }}
          initial={{ y: -SCAN_TRAVEL }}
          transition={{ duration: SCAN_SWEEP, ease: EASE_IN_OUT, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        >
          <rect fill={`url(#${gradientId})`} height={SCAN_BAND_HEIGHT} width={SCAN_CLIP.width} x={SCAN_CLIP.x} y={50 - SCAN_BAND_HEIGHT / 2} />
          <line
            opacity={0.9}
            stroke={BRAND}
            strokeLinecap="round"
            strokeWidth={1.5}
            x1={SCAN_CLIP.x + 2}
            x2={SCAN_CLIP.x + SCAN_CLIP.width - 2}
            y1={50 + SCAN_BAND_HEIGHT / 2}
            y2={50 + SCAN_BAND_HEIGHT / 2}
          />
        </m.g>
      </g>
    ) : null}
  </m.g>
);

type CheckGlyphProps = {
  canAnimate: boolean;
};

const CheckGlyph = ({ canAnimate }: CheckGlyphProps) => (
  <m.g
    animate={{ opacity: 1, scale: 1 }}
    initial={canAnimate ? { opacity: 0, scale: 0.6 } : { opacity: 1, scale: 1 }}
    style={{ transformOrigin: "50px 50px" }}
    transition={canAnimate ? CHECK_SPRING : INSTANT}
  >
    <m.path
      animate={{ pathLength: 1 }}
      d={CHECK_PATH}
      fill="none"
      initial={canAnimate ? { pathLength: 0 } : { pathLength: 1 }}
      stroke={GOOD}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={CHECK_STROKE_WIDTH}
      transition={canAnimate ? CHECK_SPRING : INSTANT}
    />
  </m.g>
);

/* -------------------------------------------------------------------------- */
/* Root                                                                       */
/* -------------------------------------------------------------------------- */

export const UnlockFaceId = ({
  children,
  className,
  buttonClassName,
  statusClassName,
  messages,
  label,
  face = true,
  live = "polite",
  onComplete,
  onScan,
  scanDuration = DEFAULT_SCAN_DURATION,
  size = DEFAULT_SIZE,
  status: controlledStatus,
}: UnlockFaceIdProps) => {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const canAnimate = !shouldReduceMotion;
  const isControlled = controlledStatus !== undefined;
  const [internalStatus, setInternalStatus] = useState<UnlockStatus>("idle");
  const status = isControlled ? controlledStatus : internalStatus;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactId = useId();
  const uid = reactId.replace(/:/g, "");
  const statusMessageId = `unlock-face-id-status-${uid}`;
  const clipId = `unlock-face-id-clip-${uid}`;
  const gradientId = `unlock-face-id-gradient-${uid}`;

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  const beginScan = useCallback(() => {
    onScan?.();
    if (isControlled) {
      return;
    }
    setInternalStatus("scanning");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setInternalStatus("success");
      onComplete?.();
    }, scanDuration);
  }, [isControlled, onComplete, onScan, scanDuration]);

  const handleTriggerClick = useCallback(() => {
    if (status === "error") {
      onScan?.();
      if (!isControlled) {
        setInternalStatus("idle");
      }
      return;
    }
    if (status === "idle") {
      beginScan();
    }
  }, [beginScan, isControlled, onScan, status]);

  const isBusy = status === "scanning";
  const isUnlocked = status === "success";
  const statusMessage = messages[status];

  return (
    <div className={cn("flex w-full flex-col items-center gap-4", className)}>
      <button
        aria-busy={isBusy}
        aria-describedby={statusMessageId}
        aria-disabled={isBusy || isUnlocked || undefined}
        aria-label={label}
        className={cn(
          "relative flex shrink-0 cursor-pointer items-center justify-center rounded-3xl text-ink transition-transform duration-150 ease-out active:scale-95 aria-disabled:cursor-default aria-disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100",
          buttonClassName
        )}
        onClick={handleTriggerClick}
        style={{ height: size, width: size }}
        type="button"
      >
        <m.svg
          animate={{ x: status === "error" && canAnimate ? SHAKE_KEYFRAMES : 0 }}
          aria-hidden="true"
          className="h-full w-full overflow-visible"
          transition={canAnimate ? { duration: SHAKE_DURATION, ease: EASE_IN_OUT } : INSTANT}
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        >
          <defs>
            <clipPath id={clipId}>
              <rect height={SCAN_CLIP.height} rx={SCAN_CLIP.rx} width={SCAN_CLIP.width} x={SCAN_CLIP.x} y={SCAN_CLIP.y} />
            </clipPath>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={BRAND} stopOpacity={0} />
              <stop offset="100%" stopColor={BRAND} stopOpacity={0.45} />
            </linearGradient>
          </defs>

          <AnimatePresence mode="wait" initial={false}>
            {isUnlocked ? (
              <CheckGlyph canAnimate={canAnimate} key="check" />
            ) : (
              <FaceGlyph canAnimate={canAnimate} clipId={clipId} face={face} gradientId={gradientId} isScanning={isBusy} key="face" stroke={STROKE_BY_STATUS[status]} />
            )}
          </AnimatePresence>
        </m.svg>
      </button>

      <p
        aria-live={live}
        className={cn("text-center font-medium text-small transition-colors duration-200", statusClassName)}
        id={statusMessageId}
        role={live === "off" ? undefined : "status"}
        style={{ color: TEXT_BY_STATUS[status] }}
      >
        {statusMessage}
      </p>

      {children ? (
        <m.div
          animate={{
            filter: isUnlocked ? "blur(0px)" : "blur(9px)",
            opacity: isUnlocked ? 1 : 0.5,
          }}
          className={cn("w-full", isUnlocked ? "" : "pointer-events-none")}
          initial={false}
          transition={canAnimate ? { duration: CONTENT_REVEAL, ease: EASE_OUT } : INSTANT}
        >
          {children}
        </m.div>
      ) : null}
    </div>
  );
};

export default UnlockFaceId;
