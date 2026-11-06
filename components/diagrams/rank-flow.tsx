// "Rank first, then stock" as a diagram-design Flowchart: the order of operations is the point,
// which prose cannot show at a glance. 6 nodes, 5 connectors, one focal node (the ranking),
// decision as a diamond, YES and NO as r=8 elbows, both labels masked with a 10px gap.
// Two layouts: horizontal from 768px, stacked below (critique round 2: no clipped diagram on phones).
// Motion hooks: every connector carries data-draw, so lib/motion.ts draws the wires with the scroll
// (stroke-dashoffset only; reduced motion and no JavaScript show them drawn). data-node, data-wire and
// data-branch name the parts so a page can light the flow one stage at a time; they change nothing alone.
type Pair = { t: string; s: string };
type Props = {
  id: string;
  title: string;
  desc: string;
  catalogue: Pair;
  ranked: Pair;
  stock: Pair;
  decide: string;
  yes: string;
  no: string;
  shown: Pair;
  alt: Pair;
  /** where each layout shows; the defaults switch at 768px. A page may keep the stacked one wider. */
  hClass?: string;
  vClass?: string;
};

type Node = "catalogue" | "ranked" | "stock" | "decide" | "shown" | "alt";

const lab = (s: string) => Math.round(s.length * 7.2 + 16);

function Box({ x, y, w, h = 64, p, focal, node }: { x: number; y: number; w: number; h?: number; p: Pair; focal?: boolean; node: Node }) {
  const top = h === 64 ? 27 : 22;
  return (
    <g data-node={node}>
      <rect x={x} y={y} width={w} height={h} rx={8} className={focal ? "box-accent" : "box"} />
      <text x={x + 14} y={y + top} className="t-name">
        {p.t}
      </text>
      <text x={x + 14} y={y + top + 19} className="t-sub">
        {p.s}
      </text>
    </g>
  );
}

function Marker({ id }: { id: string }) {
  return (
    <defs>
      <marker id={`${id}-arrow`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
        <path d="M0 0 L8 4 L0 8 z" className="mk" />
      </marker>
    </defs>
  );
}

function Horizontal(p: Props) {
  const { id } = p;
  const cy = 72;
  const cy2 = 184;
  const D = { l: 702, r: 838, cx: 770, t: cy - 40, b: cy + 40 };
  const arrow = `url(#${id}-h-arrow)`;
  return (
    <svg className="dgm" viewBox="0 0 1128 232" role="img" aria-labelledby={`${id}-h-title ${id}-h-desc`}>
      <title id={`${id}-h-title`}>{p.title}</title>
      <desc id={`${id}-h-desc`}>{p.desc}</desc>
      <Marker id={`${id}-h`} />
      <line x1={202} x2={236.5} y1={cy} y2={cy} className="wire" markerEnd={arrow} data-wire="ranked" data-draw="" />
      <line x1={434} x2={468.5} y1={cy} y2={cy} className="wire" markerEnd={arrow} data-wire="stock" data-draw="" />
      <line x1={666} x2={700.5} y1={cy} y2={cy} className="wire" markerEnd={arrow} data-wire="decide" data-draw="" />
      <line x1={D.r} x2={892.5} y1={cy} y2={cy} className="wire" markerEnd={arrow} data-wire="yes" data-draw="" />
      <path d={`M ${D.cx} ${D.b} V ${cy2 - 8} A 8 8 0 0 0 ${D.cx + 8} ${cy2} H 892.5`} className="wire" markerEnd={arrow} data-wire="no" data-draw="" />
      <g data-branch="yes">
        <rect x={866 - lab(p.yes) / 2} y={cy - 30} width={lab(p.yes)} height={18} rx={2} className="mask" />
        <text x={866} y={cy - 17} textAnchor="middle" className="t-mono">
          {p.yes}
        </text>
      </g>
      <g data-branch="no">
        <rect x={D.cx - 10 - lab(p.no)} y={136} width={lab(p.no)} height={18} rx={2} className="mask" />
        <text x={D.cx - 10 - lab(p.no) / 2} y={149} textAnchor="middle" className="t-mono">
          {p.no}
        </text>
      </g>
      <Box x={6} y={40} w={196} p={p.catalogue} node="catalogue" />
      <Box x={238} y={40} w={196} p={p.ranked} node="ranked" focal />
      <Box x={470} y={40} w={196} p={p.stock} node="stock" />
      <g data-node="decide">
        <polygon points={`${D.l},${cy} ${D.cx},${D.t} ${D.r},${cy} ${D.cx},${D.b}`} className="box" />
        <text x={D.cx} y={cy + 5} textAnchor="middle" className="t-name">
          {p.decide}
        </text>
      </g>
      <Box x={894} y={40} w={228} p={p.shown} node="shown" />
      <Box x={894} y={152} w={228} p={p.alt} node="alt" />
    </svg>
  );
}

function Vertical(p: Props) {
  const { id } = p;
  const D = { cx: 179, cy: 248, hw: 64, hh: 36 };
  const ys = [0, 72, 144];
  const out = 336;
  const arrow = `url(#${id}-v-arrow)`;
  return (
    <svg className="dgm" viewBox="0 0 358 392" role="img" aria-labelledby={`${id}-v-title ${id}-v-desc`}>
      <title id={`${id}-v-title`}>{p.title}</title>
      <desc id={`${id}-v-desc`}>{p.desc}</desc>
      <Marker id={`${id}-v`} />
      <line x1={179} x2={179} y1={52} y2={70.5} className="wire" markerEnd={arrow} data-wire="ranked" data-draw="" />
      <line x1={179} x2={179} y1={124} y2={142.5} className="wire" markerEnd={arrow} data-wire="stock" data-draw="" />
      <line x1={179} x2={179} y1={196} y2={D.cy - D.hh - 1.5} className="wire" markerEnd={arrow} data-wire="decide" data-draw="" />
      <path d={`M ${D.cx - D.hw} ${D.cy} H 93 A 8 8 0 0 0 85 ${D.cy + 8} V ${out - 1.5}`} className="wire" markerEnd={arrow} data-wire="yes" data-draw="" />
      <path d={`M ${D.cx + D.hw} ${D.cy} H 265 A 8 8 0 0 1 273 ${D.cy + 8} V ${out - 1.5}`} className="wire" markerEnd={arrow} data-wire="no" data-draw="" />
      <g data-branch="yes">
        <rect x={85 - lab(p.yes) / 2 - 6} y={D.cy - 28} width={lab(p.yes)} height={18} rx={2} className="mask" />
        <text x={85 - 6} y={D.cy - 15} textAnchor="middle" className="t-mono">
          {p.yes}
        </text>
      </g>
      <g data-branch="no">
        <rect x={273 - lab(p.no) / 2 + 6} y={D.cy - 28} width={lab(p.no)} height={18} rx={2} className="mask" />
        <text x={273 + 6} y={D.cy - 15} textAnchor="middle" className="t-mono">
          {p.no}
        </text>
      </g>
      <Box x={59} y={ys[0]} w={240} h={52} p={p.catalogue} node="catalogue" />
      <Box x={59} y={ys[1]} w={240} h={52} p={p.ranked} node="ranked" focal />
      <Box x={59} y={ys[2]} w={240} h={52} p={p.stock} node="stock" />
      <g data-node="decide">
        <polygon points={`${D.cx - D.hw},${D.cy} ${D.cx},${D.cy - D.hh} ${D.cx + D.hw},${D.cy} ${D.cx},${D.cy + D.hh}`} className="box" />
        <text x={D.cx} y={D.cy + 5} textAnchor="middle" className="t-name">
          {p.decide}
        </text>
      </g>
      <Box x={0} y={out} w={170} h={56} p={p.shown} node="shown" />
      <Box x={188} y={out} w={170} h={56} p={p.alt} node="alt" />
    </svg>
  );
}

export function RankFlow({ hClass = "hidden md:block", vClass = "mx-auto max-w-[358px] md:hidden", ...props }: Props) {
  return (
    <>
      <div className={hClass}>
        <Horizontal {...props} />
      </div>
      <div className={vClass}>
        <Vertical {...props} />
      </div>
    </>
  );
}
