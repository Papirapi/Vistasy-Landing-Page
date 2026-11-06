import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Marquee, after Magic UI's marquee (MIT, magicui.design), in CSS only: two identical tracks slide
// left forever and pause under a fine pointer. The second track is aria-hidden, so content is read once.
// Reduced motion: one static, centred row.
export function Marquee({ children, className, duration }: { children: ReactNode; className?: string; duration?: string }) {
  return (
    <div className={cn("marquee", className)} style={duration ? ({ "--duration": duration } as CSSProperties) : undefined}>
      <div className="marquee-track">{children}</div>
      <div className="marquee-track" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
