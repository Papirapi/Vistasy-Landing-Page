"use client";
// Metallic button, from craftwork.design/components/beui/button-metallic
// Source: beui by Saura (github.com/starc007/ui-components), MIT licence. Ported with VISTASY tokens:
// the chrome rim, the drifting silver and the traveling reflection are the original layers.
import { motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { EASE_IN_OUT, SPRING_PRESS } from "@/lib/craftwork/ease";
import { useHoverCapable } from "@/lib/craftwork/use-hover-capable";
import { cn } from "@/lib/utils";

const SILVER_DRIFT = { duration: 8, ease: EASE_IN_OUT, repeat: Infinity };
const CHROME_SHIMMER = { duration: 2.4, ease: EASE_IN_OUT };
const SIZE = { md: "h-10 px-5 text-[0.9375rem] gap-2", lg: "h-12 px-6 text-[0.9375rem] gap-2" } as const;

const MotionLink = motion.create(Link);

function Layers({ still, hovered, children }: { still: boolean; hovered: boolean; children: ReactNode }) {
  return (
    <>
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-[-18%] z-0 w-[136%] rounded-[inherit] bg-[linear-gradient(105deg,#111_0%,#737373_14%,#fafafa_26%,#525252_38%,#0a0a0a_50%,#a3a3a3_64%,#fff_75%,#404040_87%,#111_100%)]"
        animate={still ? undefined : { x: ["0%", "13%", "0%"] }}
        transition={still ? undefined : SILVER_DRIFT}
      />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-[-58%] z-[1] w-[52%] -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5)_48%,transparent)] opacity-50 blur-[3px] mix-blend-screen"
        animate={still ? undefined : { x: hovered ? "310%" : "0%" }}
        transition={still ? undefined : CHROME_SHIMMER}
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-[2px] z-[2] rounded-[inherit] bg-sheet transition-colors duration-200 group-hover:bg-sheet-2" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-[2px] z-[3] rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.16)]" />
      <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
    </>
  );
}

const BASE = "group relative isolate inline-flex select-none items-center justify-center overflow-hidden rounded-full font-medium text-ink shadow-[0_8px_22px_rgba(22,21,29,0.16)]";

/** A link dressed as the beui metallic button (navigation must stay a link). */
export function MetallicLink({ href, size = "md", className, children }: { href: string; size?: keyof typeof SIZE; className?: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const [hovered, setHovered] = useState(false);
  return (
    <MotionLink
      href={href}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={reduce ? undefined : { scale: 0.93 }}
      whileHover={reduce || !canHover ? undefined : { scale: 1.02 }}
      transition={SPRING_PRESS}
      className={cn(BASE, SIZE[size], className)}
    >
      <Layers still={Boolean(reduce)} hovered={hovered}>
        {children}
      </Layers>
    </MotionLink>
  );
}

/** The beui metallic button for actions inside the page. */
export function MetallicButton({ onClick, pressed, size = "md", className, children, label }: { onClick?: () => void; pressed?: boolean; size?: keyof typeof SIZE; className?: string; children: ReactNode; label?: string }) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={reduce ? undefined : { scale: 0.93 }}
      whileHover={reduce || !canHover ? undefined : { scale: 1.02 }}
      transition={SPRING_PRESS}
      className={cn(BASE, SIZE[size], className)}
    >
      <Layers still={Boolean(reduce)} hovered={hovered}>
        {children}
      </Layers>
    </motion.button>
  );
}
