"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Loads the page-level motion module after first paint and re-initialises it on every route.
export function MotionRoot() {
  const pathname = usePathname();
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const start = () =>
      import("@/lib/motion").then(({ initMotion }) => {
        if (!cancelled) cleanup = initMotion();
      });
    const idle = window.requestIdleCallback?.(start, { timeout: 700 });
    const timer = idle === undefined ? window.setTimeout(start, 150) : undefined;
    return () => {
      cancelled = true;
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
      cleanup?.();
    };
  }, [pathname]);
  return null;
}
