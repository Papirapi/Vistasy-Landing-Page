"use client";
import { useState } from "react";
import Image from "next/image";
import { DispensingLabel, type LabelData } from "@/components/label";

export type Concern = { key: string; name: string; value: number };

type Props = {
  image: { src: string; alt: string };
  concerns: Concern[];
  labels: Record<string, LabelData>;
  agree: string;
  initial: string;
  groupLabel: string;
};

// Where each concern sits on the face, in percent of the image box.
// ponytail: hand-placed zones on a placeholder photo; replace with the pipeline's overlay layers on a consented face.
const ZONES: Record<string, React.CSSProperties> = {
  texture: { left: "49.5%", top: "24%", width: "12.5%", height: "8%" },
  photodamage: { left: "48.5%", top: "13.5%", width: "14%", height: "7%" },
  blemishes: { left: "50.5%", top: "30%", width: "10%", height: "5%" },
  darkCircles: { left: "49.5%", top: "19.5%", width: "12.5%", height: "3.5%" },
};

export function HeroSequence({ image, concerns, labels, agree, initial, groupLabel }: Props) {
  const [active, setActive] = useState(initial);
  const [touched, setTouched] = useState(false);
  const delay = { "--d": touched ? "0s" : "1.7s" } as React.CSSProperties;

  return (
    <div className="hero-stage">
      <div className="hero-face plate-deep">
        <Image src={image.src} alt={image.alt} fill priority sizes="(min-width: 64rem) 50vw, 100vw" className="object-cover object-top" />
        <span className="scanline" aria-hidden="true" />
        <span key={active} className="glow" style={{ ...ZONES[active], ...delay }} aria-hidden="true" />
      </div>
      <div className="hero-chips" role="group" aria-label={groupLabel}>
        {concerns.map((c) => (
          <button
            key={c.key}
            type="button"
            className="chip"
            aria-pressed={active === c.key}
            onClick={() => {
              setTouched(true);
              setActive(c.key);
            }}
          >
            {c.name}
            <span className="num">{c.value}</span>
          </button>
        ))}
        <span className="v-tag cross">{agree}</span>
      </div>
      <div className="hero-label" style={{ ...delay, "--d": touched ? "0s" : "2.1s" } as React.CSSProperties}>
        <DispensingLabel key={active} data={labels[active]} print />
      </div>
    </div>
  );
}
