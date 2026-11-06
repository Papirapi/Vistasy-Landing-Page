// A circular gauge, after Magic UI's animated-circular-progress-bar (craftwork.design, MIT): the track, a
// shaded arc for the spread of the three reads, and the median as the ring (pathLength=100 = score units).
export type GaugeData = { value: number; lo: number; hi: number };

export function Gauge({ g, size = 46 }: { g: GaugeData; size?: number }) {
  return (
    <span className="gauge" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="g-track" cx="50" cy="50" r="41" pathLength={100} />
        <circle className="g-spread" cx="50" cy="50" r="41" pathLength={100} strokeDasharray={`${g.hi - g.lo} 100`} strokeDashoffset={-g.lo} />
        <circle className="g-val" cx="50" cy="50" r="41" pathLength={100} strokeDasharray={`${g.value} 100`} data-v={g.value} />
      </svg>
      <span className="g-num">{g.value}</span>
    </span>
  );
}
