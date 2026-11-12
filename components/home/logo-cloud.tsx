import Image from "next/image";
import { Marquee } from "@/components/kit/marquee";

const LOGOS = [
  { src: "/partners/cdc-logo.svg", alt: "Caisse des Dépôts et Consignations" },
  { src: "/partners/giz-logo.svg", alt: "GIZ, Deutsche Gesellschaft für Internationale Zusammenarbeit" },
  { src: "/partners/smartcapital-logo.svg", alt: "Smart Capital" },
  { src: "/partners/theworldbank-logo.svg", alt: "The World Bank" },
  { src: "/partners/aws-logo.svg", alt: "Amazon Web Services" },
  { src: "/partners/microsoft-logo.svg", alt: "Microsoft" },
];

// The partner marks on a slow marquee (Magic UI marquee anatomy); still and centred under reduced motion.
export default function LogoCloud({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-micro font-medium text-ink-3">{title}</p>
      <Marquee className="w-full">
        {LOGOS.map((l) => (
          <Image key={l.src} src={l.src} alt={l.alt} width={140} height={28} className="h-7 w-auto flex-none opacity-70 grayscale dark:invert" />
        ))}
      </Marquee>
    </div>
  );
}
