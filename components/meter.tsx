import { cn } from "@/lib/utils";

export type Reading = { name: string; value: number };

// Readings as meters, the app's lab-range row. data-meters lets the page fill them on scroll.
export function Readings({ items, agree, of100, className }: { items: Reading[]; agree?: string; of100?: string; className?: string }) {
  return (
    <div className={className} data-meters="">
      {items.map((r) => (
        <div className="reading" key={r.name}>
          <span className="name">{r.name}</span>
          <span className="val">
            {r.value}
            {of100 && <small>{of100}</small>}
          </span>
          <span className="meter" style={{ "--v": r.value / 100 } as React.CSSProperties}>
            <i />
          </span>
        </div>
      ))}
      {agree && <span className={cn("v-tag cross mt-3")}>{agree}</span>}
    </div>
  );
}
