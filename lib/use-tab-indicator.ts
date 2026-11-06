import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

// The sliding pill behind the selected tab (after Smooth UI's animated-tabs, MIT). It measures the
// selected tab and follows it; the first placement is instant, later moves glide (CSS on .seg-ind).
// Until it has measured, the selected tab keeps its own background, so nothing depends on it.
export function useTabIndicator<T extends HTMLElement>(selected: string) {
  const list = useRef<T>(null);
  const [style, setStyle] = useState<CSSProperties | null>(null);
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    const el = list.current;
    if (!el) return;
    const measure = () => {
      const tab = el.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      if (tab) setStyle({ left: tab.offsetLeft, width: tab.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const raf = requestAnimationFrame(() => setReady(true));
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [selected]);
  return { list, indicator: style, ready };
}
