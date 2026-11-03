import Image from "next/image";

const LOGOS = [
  { src: "/partners/cdc-logo.svg", alt: "Caisse des Dépôts et Consignations" },
  { src: "/partners/giz-logo.svg", alt: "GIZ, Deutsche Gesellschaft für Internationale Zusammenarbeit" },
  { src: "/partners/nabda-logo.svg", alt: "Nabda" },
  { src: "/partners/smartcapital-logo.svg", alt: "Smart Capital" },
  { src: "/partners/theworldbank-logo.svg", alt: "The World Bank" },
];

// A quiet monochrome row; a CSS marquee only on phones, static and wrapped under reduced motion.
export default function LogoCloud({ title }: { title: string }) {
  const row = (prefix: string, hidden = false) =>
    LOGOS.map((l) => (
      <Image
        key={prefix + l.src}
        src={l.src}
        alt={hidden ? "" : l.alt}
        aria-hidden={hidden || undefined}
        width={140}
        height={28}
        className="h-6 w-auto opacity-75 grayscale dark:invert"
      />
    ));
  return (
    <div>
      <p className="text-sm font-semibold text-ink-3">{title}</p>
      <div className="mt-6 hidden items-center justify-between gap-10 md:flex">{row("a")}</div>
      <div className="mt-6 overflow-hidden md:hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="marquee items-center">
          {row("b")}
          {row("c", true)}
        </div>
      </div>
    </div>
  );
}
