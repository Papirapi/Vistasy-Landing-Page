"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useGSAP } from "@/lib/gsap-client";

// Whether the hero is on screen, for the live details inside it: the phone's radar sweep on the face turns
// only while the hero is in view (it replaced the scan line this file used to loop). Outside a hero, a phone
// counts as on screen. Everything in the hero is visible from the first paint and needs no script.
const HeroLive = createContext<{ inView: boolean }>({ inView: true });
export const useHeroLive = () => useContext(HeroLive);

export function HeroMotion({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useGSAP(() => {
    document.documentElement.classList.add("motion-ok");
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <HeroLive.Provider value={{ inView }}>
      <section ref={ref} className={className} data-intro="">
        {children}
      </section>
    </HeroLive.Provider>
  );
}
