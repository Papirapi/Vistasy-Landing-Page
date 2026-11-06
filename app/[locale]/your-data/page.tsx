import type { CSSProperties } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/meta";
import { APP_URL, CONTACT_EMAIL } from "@/constants/navbar-items-list";
import { Split } from "@/components/split";
import { Icon } from "@/components/icon";
import { DottedMap } from "@/components/craftwork/dotted-map";

// Page motion on the kit's tokens, shipped inside the page (React hoists it into <head>; an imported route
// stylesheet would be preloaded, and warned about, on every page that links here). The facts in the first
// screen are set down after the headline lands, in CSS from the first paint; the rest are set down by the
// scroll preset as they arrive (data-reveal="lift" on their wrappers). Reduced motion: none.
// The photo's route on the map is drawn once its card has been set down, from Frankfurt to London, and the
// arrowhead lands last; without motion it is simply there.
const MOTION = `@media (prefers-reduced-motion: no-preference) {
  .yd-in { animation: yd-set 0.8s var(--ease-out) both; animation-delay: calc(0.3s + var(--d, 0) * 80ms); }
  .yd-draw { animation: yd-draw 1.1s var(--ease-move) 1.1s both; }
  .yd-head { animation: yd-head 0.32s var(--ease-out) 2.05s both; }
}
@keyframes yd-set { from { opacity: 0; transform: translateY(30px) scale(0.97); } }
@keyframes yd-draw { from { stroke-dashoffset: 1; } }
@keyframes yd-head { from { opacity: 0; } }`;

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  return pageMeta(locale, "yourData", "/your-data");
}

// Everything the site and the owner's published methodology say about data, in one findable place
// (critique rounds 2 and 3). Facts only; it is a plain summary, not the legal privacy policy.
const ROWS = [
  { key: "before", icon: "i-user-focus" },
  { key: "where", icon: "i-globe-hemisphere-west" },
  { key: "control", icon: "i-trash" },
  { key: "email", icon: "i-envelope-simple" },
  { key: "medical", icon: "i-first-aid" },
  { key: "sarah", icon: "i-chat-teardrop-text" },
  { key: "retailers", icon: "i-shopping-bag" },
] as const;

// Where a photo goes, as the "where" row says it: stored in Frankfurt, read in London (Google Gemini and our
// own image models), copies deleted once read. Magic UI's dotted map, cropped to the two cities: a marker on
// each, a dotted route from Frankfurt to London, and a label beside each marker in HTML so it stays legible
// at phone width. The whole figure is one image to a screen reader, named by the same facts.
const FRANKFURT = { lat: 50.1109, lng: 8.6821, size: 1.15 };
const LONDON = { lat: 51.5072, lng: -0.1276, size: 1.15 };
const REGION = { lat: { min: 40, max: 61 }, lng: { min: -15, max: 25 } };

type RouteStrings = { label: string; london: string; read: string; readBy: string; frankfurt: string; stored: string };

function PhotoRoute({ s }: { s: RouteStrings }) {
  return (
    <figure role="img" aria-label={s.label} className="yd-map relative m-0 overflow-hidden rounded-[var(--r-tile)] bg-ground-2 p-2 sm:p-3">
      <DottedMap
        width={128}
        height={86}
        mapSamples={7000}
        region={REGION}
        dotRadius={0.34}
        markers={[FRANKFURT, LONDON]}
        aria-hidden="true"
        className="text-ink-4/70"
        renderMarkerOverlay={({ x, y, r }) => <circle cx={x} cy={y} r={r * 2.2} fill="none" stroke="var(--cross)" strokeOpacity={0.4} strokeWidth={0.3} />}
        renderRoute={([f, l]) => {
          // a low quadratic arc that rises between the cities, leaving each marker's ring clear, with an
          // arrowhead at London: the photo travels from where it is stored to where it is read. It arrives
          // from the right, under London's label, which sits above and to the left of the marker
          const d = Math.hypot(l.x - f.x, l.y - f.y);
          const cx = (f.x + l.x) / 2;
          const cy = Math.min(f.y, l.y) - d * 0.2;
          const gap = (f.size ?? 1) * 2.9;
          const a0 = Math.atan2(cy - f.y, cx - f.x);
          const a1 = Math.atan2(l.y - cy, l.x - cx);
          const sx = f.x + Math.cos(a0) * gap;
          const sy = f.y + Math.sin(a0) * gap;
          const ex = l.x - Math.cos(a1) * gap;
          const ey = l.y - Math.sin(a1) * gap;
          const len = 1.9;
          const half = 1.05;
          const bx = ex - Math.cos(a1) * len;
          const by = ey - Math.sin(a1) * len;
          const head = `M${ex} ${ey}L${bx - Math.sin(a1) * half} ${by + Math.cos(a1) * half}L${bx + Math.sin(a1) * half} ${by - Math.cos(a1) * half}Z`;
          const path = `M${sx} ${sy}Q${cx} ${cy} ${bx} ${by}`;
          return (
            <g>
              <mask id="yd-route-mask" maskUnits="userSpaceOnUse">
                <path className="yd-draw" d={path} fill="none" stroke="#fff" strokeWidth={2.4} pathLength={1} strokeDasharray="1" />
              </mask>
              <path d={path} fill="none" stroke="var(--cross)" strokeWidth={0.62} strokeLinecap="round" pathLength={1} strokeDasharray="0 0.032" mask="url(#yd-route-mask)" />
              <path className="yd-head" d={head} fill="var(--cross)" />
            </g>
          );
        }}
        renderLabels={([f, l], size) => (
          <>
            <MapLabel x={l.x / size.width} y={l.y / size.height} side="above-left" title={s.london} text={s.read} detail={s.readBy} />
            <MapLabel x={f.x / size.width} y={f.y / size.height} side="below" title={s.frankfurt} text={s.stored} />
          </>
        )}
      />
    </figure>
  );
}

// the detail line is left out at phone width, where the label would cover the route; the paragraph above
// and the figure's name both carry it
function MapLabel({ x, y, side, title, text, detail }: { x: number; y: number; side: "above-left" | "below"; title: string; text: string; detail?: string }) {
  const style: CSSProperties =
    side === "above-left"
      ? { right: `calc(${(1 - x) * 100}% - 10px)`, bottom: `calc(${(1 - y) * 100}% + 10px)` }
      : { left: `${x * 100}%`, top: `calc(${y * 100}% + 12px)`, translate: "-50% 0" };
  return (
    <span aria-hidden="true" className="absolute flex max-w-[11rem] flex-col rounded-[var(--r-label)] bg-sheet px-2 py-1 shadow-[var(--edge),var(--e1)] sm:px-2.5 sm:py-1.5 dark:bg-sheet-2" style={style}>
      <span className="text-micro font-medium text-ink">{title}</span>
      <span className="text-micro text-ink-3">{text}</span>
      {detail && <span className="hidden text-micro text-ink-3 sm:block">{detail}</span>}
    </span>
  );
}

// The title, the promise and the two ways to ask more stay in view (pinned on wide screens by the kit's
// scrollytelling preset, a normal column on phones and under reduced motion) while the facts pass beside
// them as cards resting on the page, each set down as it arrives.
export default async function YourData({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("DataPage");
  return (
    <section aria-labelledby="data-h">
      <style href="vistasy-data-motion" precedence="default">
        {MOTION}
      </style>
      <div className="wrap pt-10 pb-[var(--space-section)] md:pt-16">
        <div data-scrolly="" className="lg:grid lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:gap-20">
          {/* Below lg this column sits above the facts, so it must not hold its place: the kit makes the visual
              sticky on phones, and pins it wherever the smoother runs (a narrow desktop window), so here it stays
              in the flow, the pin's transform is cancelled and its top is auto (the pin copies the computed top
              onto its spacer). Wide screens keep the pin beside the facts. */}
          <div className="scrolly-visual max-lg:static max-lg:top-auto max-lg:transform-none! lg:self-start" data-intro="">
            <Split id="data-h" as="h1" intro text={t("title")} className="text-display max-w-[13ch]" />
            <p className="lede mt-6 max-w-[34rem]" data-hero-fade="">
              {t("lede")}
            </p>
            <div className="mt-8 flex flex-col gap-2 text-small text-ink-2 lg:mt-10" data-hero-fade="1">
              <p>
                {t("contact")}
                <br />
                <a href={`mailto:${CONTACT_EMAIL}`} className="link">
                  {CONTACT_EMAIL}
                </a>
              </p>
              <a href={`${APP_URL}/methodology.html`} className="link-arrow self-start">
                <span>{t("method")}</span>
                <Icon name="i-arrow-up-right" />
              </a>
            </div>
          </div>
          <ul data-scrolly-steps="" className="mt-12 flex flex-col gap-5 md:mt-16 lg:mt-0 lg:gap-6">
            {ROWS.map((r, i) => (
              <li key={r.key} data-scrolly-step="" data-on={i === 0 ? "true" : "false"}>
                <div data-reveal="lift">
                  <article className="yd-in s2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 p-6 sm:gap-x-6 sm:p-8" style={{ "--d": i } as CSSProperties}>
                    <Icon name={r.icon} className="ico mt-0.5 h-6 w-6 text-ink-2 sm:h-7 sm:w-7" />
                    <div>
                      <h2 className="text-title">{t(`rows.${r.key}.title`)}</h2>
                      <p className="mt-2 max-w-[56ch] text-ink-2">{t(`rows.${r.key}.text`)}</p>
                    </div>
                    {r.key === "where" && (
                      <div className="col-span-2 mt-6 sm:col-span-1 sm:col-start-2">
                        <PhotoRoute s={{ label: t("map.label"), london: t("map.london"), read: t("map.read"), readBy: t("map.readBy"), frankfurt: t("map.frankfurt"), stored: t("map.stored") }} />
                      </div>
                    )}
                  </article>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
