// The journey as a diagram-design "Process" with three zones and one repeat loop.
// Taste gate: 7 nodes (budget 9), 7 connectors (budget 12), one focal node (13 readings),
// orthogonal connectors with r=8 elbows, the loop label on an opaque mask with an 8-10px gap,
// arrows drawn before boxes, no shadows, radius 8, 4px grid. Skinned with the site tokens.
// Two layouts: horizontal from 768px, vertical below (critique round 2: no clipped diagram on phones).
// Drawing (components/how/journey-draw.tsx): the forward wires sit under a mask whose rect grows in the
// reading direction ([data-sweep]); the dashed loop sits under a mask path drawn by its dash offset
// ([data-loop-draw], data-len is its length), so the dashes and the arrowheads survive the draw (a dash
// offset on the wire itself would turn the loop solid); the loop label fades in last ([data-loop-label]).
// The masks are open in the markup: without JavaScript or with reduced motion the diagram is complete.
type Node = { key: string; t: string; s: string };
type Props = {
  id: string;
  locale: string;
  title: string;
  desc: string;
  zones: { before: string; read: string; after: string };
  nodes: Node[]; // 7, in order
  loop: string;
  legend: { step: string; loop: string };
};

const FOCAL = "readings";
const ARC = 4 * Math.PI; // a quarter turn of radius 8
const round = (n: number) => Math.round(n * 10) / 10;

function Defs({ id, children }: { id: string; children?: React.ReactNode }) {
  return (
    <defs>
      <marker id={`${id}-arrow`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <path d="M0 0 L8 4 L0 8 z" className="mk" />
      </marker>
      {children}
    </defs>
  );
}

// the reveal masks: open (fully white) as rendered; journey-draw closes and redraws them
function Masks({ id, W, H, sweep, loop }: { id: string; W: number; H: number; sweep: { axis: "x" | "y"; at: number; size: number }; loop: { d: string; len: number } }) {
  const rect = sweep.axis === "x" ? { x: sweep.at, y: 0, width: sweep.size, height: H } : { x: 0, y: sweep.at, width: W, height: sweep.size };
  return (
    <>
      <mask id={`${id}-fwd`} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
        <rect data-sweep={sweep.axis} {...rect} fill="white" />
      </mask>
      <mask id={`${id}-loop`} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
        <path d={loop.d} data-loop-draw="" data-len={round(loop.len)} fill="none" stroke="white" strokeWidth={16} />
      </mask>
    </>
  );
}

function Horizontal({ id, locale, title, desc, zones, nodes, loop, legend }: Props) {
  const W = 1128;
  const H = 264;
  const BW = 132;
  const BH = 64;
  const BY = 64;
  const XS = [6, 162, 318, 498, 654, 834, 990];
  const cy = BY + BH / 2;
  const zoneDefs = [
    { label: zones.before, from: XS[0], to: XS[2] + BW },
    { label: zones.read, from: XS[3], to: XS[4] + BW },
    { label: zones.after, from: XS[5], to: XS[6] + BW },
  ];
  const top = BY + BH;
  const loopY = top + 52;
  const sx = XS[1] + BW / 2;
  const ex = XS[6] + BW / 2;
  const run = `M ${ex} ${top} V ${loopY - 8} A 8 8 0 0 1 ${ex - 8} ${loopY} H ${sx + 8} A 8 8 0 0 1 ${sx} ${loopY - 8}`;
  const loopPath = `${run} V ${top + 1.5}`;
  // the reveal runs 6 units past the end so the arrowhead is uncovered with its line
  const reveal = { d: `${run} V ${top - 4.5}`, len: loopY - 8 - top + ARC + (ex - sx - 16) + ARC + (loopY - 8 - (top - 4.5)) };
  const sweepAt = XS[0] + BW - 2;
  const labelW = Math.round(loop.length * 6.9 + 18);
  const labelX = (sx + ex) / 2;
  const hid = `${id}-h`;
  return (
    <svg className="dgm" viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${hid}-title ${hid}-desc`}>
      <title id={`${hid}-title`}>{title}</title>
      <desc id={`${hid}-desc`}>{desc}</desc>
      <Defs id={hid}>
        <Masks id={hid} W={W} H={H} sweep={{ axis: "x", at: sweepAt, size: XS[6] - sweepAt + 4 }} loop={reveal} />
      </Defs>
      {zoneDefs.map((z) => (
        <g key={z.label}>
          <text x={z.from} y={28} className="t-mono">
            {z.label.toLocaleUpperCase(locale)}
          </text>
          <line x1={z.from} x2={z.to} y1={40} y2={40} className="zone-rule" />
        </g>
      ))}
      <g mask={`url(#${hid}-fwd)`}>
        {XS.slice(0, -1).map((x, i) => (
          <line key={i} x1={x + BW} x2={XS[i + 1] - 1.5} y1={cy} y2={cy} className="wire" markerEnd={`url(#${hid}-arrow)`} />
        ))}
      </g>
      <g mask={`url(#${hid}-loop)`}>
        <path d={loopPath} className="wire dash" markerEnd={`url(#${hid}-arrow)`} />
      </g>
      <g data-loop-label="">
        <rect x={labelX - labelW / 2} y={loopY + 8} width={labelW} height={20} rx={2} className="mask" />
        <text x={labelX} y={loopY + 22} textAnchor="middle" className="t-mono">
          {loop}
        </text>
      </g>
      {nodes.map((n, i) => (
        <g key={n.key}>
          <rect x={XS[i]} y={BY} width={BW} height={BH} rx={8} className={n.key === FOCAL ? "box-accent" : "box"} />
          <text x={XS[i] + 14} y={BY + 27} className="t-name">
            {n.t}
          </text>
          <text x={XS[i] + 14} y={BY + 46} className="t-sub">
            {n.s}
          </text>
        </g>
      ))}
      <g transform={`translate(6 ${H - 22})`}>
        <line x1={0} x2={26} y1={0} y2={0} className="wire" markerEnd={`url(#${hid}-arrow)`} />
        <text x={36} y={4} className="t-sub">
          {legend.step}
        </text>
        <line x1={170} x2={196} y1={0} y2={0} className="wire dash" markerEnd={`url(#${hid}-arrow)`} />
        <text x={206} y={4} className="t-sub">
          {legend.loop}
        </text>
      </g>
    </svg>
  );
}

function Vertical({ id, locale, title, desc, zones, nodes, loop, legend }: Props) {
  const W = 358;
  const H = 604;
  const BX = 40;
  const BW = 228;
  const BH = 52;
  const YS = [8, 76, 144, 228, 296, 380, 448];
  const cx = BX + BW / 2; // 154
  const zoneDefs = [
    { label: zones.before, from: YS[0], to: YS[2] + BH },
    { label: zones.read, from: YS[3], to: YS[4] + BH },
    { label: zones.after, from: YS[5], to: YS[6] + BH },
  ];
  const selfieMid = YS[1] + BH / 2;
  const bottom = YS[6] + BH; // 500
  const loopY = bottom + 32; // 532
  const run = `M ${cx} ${bottom} V ${loopY - 8} A 8 8 0 0 1 ${cx - 8} ${loopY} H 24 A 8 8 0 0 1 16 ${loopY - 8} V ${selfieMid + 8} A 8 8 0 0 1 24 ${selfieMid}`;
  const loopPath = `${run} H ${BX - 1.5}`;
  const reveal = { d: `${run} H ${BX + 4.5}`, len: loopY - 8 - bottom + ARC + (cx - 8 - 24) + ARC + (loopY - 8 - (selfieMid + 8)) + ARC + (BX + 4.5 - 24) };
  const sweepAt = YS[0] + BH - 2;
  const labelW = Math.round(loop.length * 6.9 + 18);
  const labelX = Math.max(BX + labelW / 2 - 16, (24 + cx) / 2);
  const vid = `${id}-v`;
  return (
    <svg className="dgm" viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${vid}-title ${vid}-desc`}>
      <title id={`${vid}-title`}>{title}</title>
      <desc id={`${vid}-desc`}>{desc}</desc>
      <Defs id={vid}>
        <Masks id={vid} W={W} H={H} sweep={{ axis: "y", at: sweepAt, size: YS[6] - sweepAt + 4 }} loop={reveal} />
      </Defs>
      {zoneDefs.map((z) => (
        <g key={z.label}>
          <line x1={280} x2={280} y1={z.from} y2={z.to} className="zone-rule" />
          <text x={288} y={z.from + 10} className="t-mono">
            {z.label.toLocaleUpperCase(locale)}
          </text>
        </g>
      ))}
      <g mask={`url(#${vid}-fwd)`}>
        {YS.slice(0, -1).map((y, i) => (
          <line key={i} x1={cx} x2={cx} y1={y + BH} y2={YS[i + 1] - 1.5} className="wire" markerEnd={`url(#${vid}-arrow)`} />
        ))}
      </g>
      <g mask={`url(#${vid}-loop)`}>
        <path d={loopPath} className="wire dash" markerEnd={`url(#${vid}-arrow)`} />
      </g>
      <g data-loop-label="">
        <rect x={labelX - labelW / 2} y={loopY + 10} width={labelW} height={20} rx={2} className="mask" />
        <text x={labelX} y={loopY + 24} textAnchor="middle" className="t-mono">
          {loop}
        </text>
      </g>
      {nodes.map((n, i) => (
        <g key={n.key}>
          <rect x={BX} y={YS[i]} width={BW} height={BH} rx={8} className={n.key === FOCAL ? "box-accent" : "box"} />
          <text x={BX + 14} y={YS[i] + 22} className="t-name">
            {n.t}
          </text>
          <text x={BX + 14} y={YS[i] + 40} className="t-sub">
            {n.s}
          </text>
        </g>
      ))}
      <g transform={`translate(0 ${H - 14})`}>
        <line x1={0} x2={24} y1={0} y2={0} className="wire" markerEnd={`url(#${vid}-arrow)`} />
        <text x={32} y={4} className="t-sub">
          {legend.step}
        </text>
        <line x1={170} x2={194} y1={0} y2={0} className="wire dash" markerEnd={`url(#${vid}-arrow)`} />
        <text x={202} y={4} className="t-sub">
          {legend.loop}
        </text>
      </g>
    </svg>
  );
}

export function JourneyDiagram(props: Props) {
  return (
    <>
      <div className="hidden md:block">
        <Horizontal {...props} />
      </div>
      <div className="mx-auto max-w-[358px] md:hidden">
        <Vertical {...props} />
      </div>
    </>
  );
}
