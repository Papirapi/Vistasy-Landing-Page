import { cn } from "@/lib/utils";

export type Reading = { name: string; value: number; hi?: boolean };

// Readings as meters, the app's lab-range row after v5.4.
export function Readings({ items, agree, of100, className }: { items: Reading[]; agree?: string; of100?: string; className?: string }) {
  return (
    <div className={className}>
      {items.map((r) => (
        <div className={cn("reading", r.hi && "hi")} key={r.name}>
          <span className="name">{r.name}</span>
          <span className="val">
            {r.value}
            {of100 && <small> {of100}</small>}
          </span>
          <span className="meter" style={{ "--v": r.value / 100 } as React.CSSProperties}>
            <i />
          </span>
        </div>
      ))}
      {agree && <span className="v-tag cross mt-3">{agree}</span>}
    </div>
  );
}
