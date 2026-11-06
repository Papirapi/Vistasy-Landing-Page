import { cn } from "@/lib/utils";

// A number that counts up once when it scrolls into view (after Magic UI's number-ticker, MIT).
// The final value is server-rendered and read by screen readers; the count itself is decoration.
export function Ticker({ value, decimals = 0, locale = "en", className }: { value: number; decimals?: number; locale?: string; className?: string }) {
  const text = new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
  return (
    <>
      <span aria-hidden="true" className={cn("tnum", className)} data-ticker={value} data-decimals={decimals}>
        {text}
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}
