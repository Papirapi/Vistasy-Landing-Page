"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { m, AnimatePresence, useInView, useReducedMotion } from "motion/react";
import { Iphone } from "@/components/craftwork/iphone";
import { DynamicIsland } from "@/components/craftwork/dynamic-island";
import { UnlockFaceId, type UnlockStatus } from "@/components/craftwork/unlock-face-id";
import { RadarSweep } from "@/components/craftwork/radar-sweep";
import { useHeroLive } from "@/components/home/hero-motion";
import { DispensingLabel, type LabelData } from "@/components/label";
import { VerdictBand } from "@/components/verdict";
import { Gauge } from "@/components/kit/gauge";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

export type PhoneReading = { key: string; name: string; value: number; lo: number; hi: number };
// shutter: HomePage.hero.phone.shutter ("Take the photo"), the shutter button's name; until the page passes
// it, the button is named after what it plays, the sample read (sheet.title)
export type PhoneStrings = { selfie: string; product: string; gate: string; title: string; meta: string; agree: string; shown: string; quality: string; shutter?: string };

type Mode = "selfie" | "product";
type IslandView = "idle" | "quality" | "title" | "agree";

const SCAN_MS = 1800; // Unlock Face ID's own scan length
const HOLD_MS = 1600; // the check stays, then the shutter is ready again
const ISLAND_MS = 1800; // each live status on the island
const START_MS = 700; // the first read waits for the hero's entrance to settle
const ISLAND_SEQUENCE: IslandView[] = ["quality", "title", "agree", "idle"];
// the island's spring per pair of views, in the spirit of Smooth UI's table: a fuller bounce out of the
// resting pill, a firmer one between statuses, the softest back to rest
const ISLAND_BOUNCE = { "idle-quality": 0.5, "quality-title": 0.35, "title-agree": 0.35, "agree-idle": 0.3 };

// one live status on the island: an icon in the camera's inks and a short line of existing copy
function IslandStatus({ icon, tone, text }: { icon: string; tone: string; text: string }) {
  return (
    <span className="flex h-[10cqw] min-w-[28.6cqw] items-center gap-[1.8cqw] whitespace-nowrap pr-[3.6cqw] pl-[3cqw] text-[0.75rem] font-medium leading-none">
      <Icon name={icon} className={cn("ico size-[14px] flex-none", tone)} />
      {text}
    </span>
  );
}

// The app on a phone (Magic UI's iPhone frame): its camera is the hero, and the same phone follows the reader
// through the steps of one read (the motion preset switches the panels). The camera's backdrop is
// componentry's WebGL Liquid in the brand's lavender. Selfie and Product switch the camera mode, as in the
// app. The read plays when the phone first comes into view and whenever the shutter is pressed: Smooth UI's
// Unlock Face ID scans in the shutter, amicro's radar sweep turns on the face, and Smooth UI's Dynamic Island
// carries the read's statuses (decorative: the same facts are text in the status line and the panels).
export function Phone({ person, readings, label, check, s }: { person: { src: string; alt: string }; readings: PhoneReading[]; label: LabelData; check: { img: string; name: string; meta: string; title: string; text: string }; s: PhoneStrings }) {
  const [mode, setMode] = useState<Mode>("selfie");
  const [status, setStatus] = useState<UnlockStatus>("idle");
  const [island, setIsland] = useState<IslandView>("idle");
  const [tapped, setTapped] = useState(false);
  const reduce = useReducedMotion();
  const hero = useHeroLive();
  const camRef = useRef<HTMLDivElement>(null);
  const seen = useInView(camRef, { amount: 0.4 });
  const timers = useRef<number[]>([]);
  const started = useRef(false);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const clear = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);
  const read = useCallback(
    (m: Mode) => {
      clear();
      const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
      setIsland("idle");
      setStatus("scanning");
      at(SCAN_MS, () => setStatus("success"));
      at(SCAN_MS + HOLD_MS, () => setStatus("idle"));
      if (m === "selfie") ISLAND_SEQUENCE.forEach((v, k) => at(SCAN_MS + k * ISLAND_MS, () => setIsland(v)));
    },
    [clear]
  );

  // the read starts the first time the phone is in view; under reduced motion it waits for the shutter
  useEffect(() => {
    if (started.current || !seen || reduce) return;
    started.current = true;
    timers.current.push(window.setTimeout(() => read(modeRef.current), START_MS));
  }, [seen, reduce, read]);
  useEffect(() => clear, [clear]);

  const pick = (m: Mode) => {
    if (m === mode) return;
    clear();
    setStatus("idle");
    setIsland("idle");
    setMode(m);
  };
  const shoot = () => {
    setTapped(true);
    read(mode);
  };

  const messages =
    mode === "selfie" ? { idle: s.meta, scanning: s.gate, success: s.quality, error: s.gate } : { idle: check.name, scanning: s.gate, success: check.name, error: s.gate };

  return (
    <Iphone
      className="rounded-[16.9%/8.3%] shadow-[var(--e4)]"
      screenClassName="cw-cam isolate bg-[var(--cam)] leading-[1.6] text-white"
      island={
        <DynamicIsland
          aria-hidden="true"
          data-island=""
          view={island}
          bounce={ISLAND_BOUNCE}
          islandClassName="min-w-0"
          views={{
            idle: (
              <span className="relative block h-[8.55cqw] w-[28.6cqw]">
                <i className="absolute top-1/2 left-[85.1%] size-[2.54cqw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10" />
              </span>
            ),
            quality: <IslandStatus icon="i-check-circle-fill" tone="text-[var(--cam-good)]" text={s.quality} />,
            title: <IslandStatus icon="i-read" tone="text-white" text={s.title} />,
            agree: <IslandStatus icon="i-seal-check-fill" tone="text-[var(--cam-cross)]" text={s.agree} />,
          }}
        />
      }
    >
      {/* the status bar steps aside while the island carries a status, as on the phone */}
      <span className={cn("phone-status top-[3.47%] -translate-y-1/2 leading-none transition-opacity duration-300 dark:text-ink", island !== "idle" && "opacity-0")} aria-hidden="true">
        <span>9:41</span>
        <span className="phone-batt" />
      </span>

      {/* 0: the camera */}
      <div ref={camRef} className="phone-panel" data-follow-panel="" data-on="true">
        {/* the camera's backdrop: lavender light in CSS (the WebGL liquid left see-through patches over the dark
            camera on some graphics cards, read as black blots); one slow drift, still under reduced motion */}
        <span className="cam-backdrop" aria-hidden="true" />
        <AnimatePresence mode="wait" initial={false}>
          {mode === "selfie" ? (
            <m.div key="selfie" className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <div className="absolute bottom-[-6%] left-1/2 h-[92%] -translate-x-[42%]" style={{ aspectRatio: "625 / 753" }} data-hero-photo="">
                <Image src={person.src} alt={person.alt} fill priority sizes="360px" className="object-contain object-bottom" />
                <span className="scan-frame" aria-hidden="true">
                  <RadarSweep theme="accent" size="74%" active={seen && hero.inView} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </span>
              </div>
            </m.div>
          ) : (
            <m.div key="product" className="absolute inset-0 grid place-items-center" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <div className="relative grid h-[46%] w-[62%] place-items-center rounded-[28px] bg-white/80 shadow-[var(--e2)]">
                <Image src={check.img} alt="" width={150} height={150} className="h-[70%] w-auto object-contain" />
                <span className="scan-frame !inset-[8%] !h-auto !w-auto" aria-hidden="true" />
              </div>
            </m.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-x-[7%] top-[9%] flex items-center justify-between" aria-hidden="true">
          <span className="ph-btn size-[min(44px,12cqw)] text-[#16151d]">
            <Icon name="i-plus" className="ico rotate-45" />
          </span>
          <span className="ph-btn size-[min(44px,12cqw)] text-[#16151d]">
            <Icon name="i-sun" className="ico" />
          </span>
        </div>
        {/* the camera sheet: readings either side of the shutter, the read's status line, the mode switch */}
        <div className="absolute inset-x-0 bottom-0 grid grid-cols-[repeat(5,auto)] items-center justify-center gap-x-[min(12px,2.6cqw)] gap-y-2 rounded-t-[28px] bg-[var(--cam)]/88 px-4 pt-4 pb-5 backdrop-blur">
          {readings.slice(0, 4).map((r) => (
            <span key={r.key} aria-hidden="true" className="ph-thumb grid size-[min(44px,12.5cqw)] place-items-center bg-white text-[0.6875rem] font-semibold text-[#16151d]">
              {r.value}
            </span>
          ))}
          <UnlockFaceId
            status={status}
            onScan={shoot}
            label={s.shutter ?? s.title}
            messages={messages}
            face={mode === "selfie"}
            live={tapped ? "polite" : "off"}
            size="min(74px, 21cqw)"
            className="contents"
            buttonClassName="ph-shutter col-start-3 row-start-1 rounded-full p-[15%] text-white transition-[transform,background-color] duration-200 hover:bg-white/10"
            statusClassName="col-span-5 row-start-2 min-h-[1.6em] !text-[0.75rem] leading-[1.6] text-balance"
          />
          <div role="group" aria-label={`${s.selfie} / ${s.product}`} className="col-span-5 row-start-3 flex justify-self-center rounded-full bg-white/10 p-1">
            {(["selfie", "product"] as const).map((m) => (
              <button key={m} type="button" aria-pressed={mode === m} onClick={() => pick(m)} className={`min-h-[36px] rounded-full px-4 text-[0.8125rem] font-medium transition-colors ${mode === m ? "bg-white text-[#16151d]" : "text-white/80"}`}>
                {s[m]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 1: the readings */}
      <div className="phone-panel bg-ground" data-follow-panel="" aria-hidden="true">
        <div className="flex h-full flex-col gap-3 px-5 pt-[22%] text-ink">
          <p className="text-small text-ink-3">{s.meta}</p>
          <p className="text-title">{s.title}</p>
          {readings.map((r) => (
            <span key={r.key} className="g-card">
              <Gauge g={r} size={40} />
              <span className="g-name">{r.name}</span>
            </span>
          ))}
          <span className="v-tag cross self-start">{s.agree}</span>
        </div>
      </div>

      {/* 2: the routine label */}
      <div className="phone-panel bg-ground" data-follow-panel="" aria-hidden="true">
        <div className="grid h-full place-items-center px-4 pt-[14%] text-ink">
          <div className="w-full">
            <DispensingLabel data={label} className="sheet-lift" />
          </div>
        </div>
      </div>

      {/* 3: the product check */}
      <div className="phone-panel bg-ground" data-follow-panel="" aria-hidden="true">
        <div className="flex h-full flex-col justify-center gap-4 px-5 text-ink">
          <div className="flex items-center gap-3">
            <span className="label-img h-16 w-16 flex-none">
              <Image src={check.img} alt="" width={64} height={64} />
            </span>
            <span>
              <span className="block text-title">{check.name}</span>
              <span className="block text-small text-ink-3">{check.meta}</span>
            </span>
          </div>
          <VerdictBand kind="caution" title={check.title} text={check.text} />
        </div>
      </div>
    </Iphone>
  );
}
