import { Icon } from "@/components/icon";

const ICONS = { fits: "i-seal-check-fill", caution: "i-seal-warning", neutral: "i-equals" } as const;

// The verdict band that leads a product check.
export function VerdictBand({ kind, title, text }: { kind: keyof typeof ICONS; title: string; text: string }) {
  return (
    <div className={`verdict-band ${kind}`}>
      <span className="vb-ic"><Icon name={ICONS[kind]} /></span>
      <span className="vb-t">
        <strong>{title}</strong>
        <span>{text}</span>
      </span>
    </div>
  );
}
