import { useEffect, useState } from "react";

// true only for devices that can really hover (a fine pointer): hover effects skip touch (beui helper)
export function useHoverCapable() {
  const [can, setCan] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const on = () => setCan(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return can;
}
