import { cn } from "@/lib/utils";

// One section = one idea. Generous separation, tight groups inside.
export function Section({
  id,
  title,
  lede,
  children,
  className,
  as: Heading = "h2",
}: {
  id?: string;
  title?: string;
  lede?: string;
  children?: React.ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <section id={id} className={cn("rise mx-auto w-full max-w-[75rem] px-[var(--gutter)] py-[var(--space-section)]", className)}>
      {title && <Heading className={cn(Heading === "h1" ? "text-display" : "text-headline", "max-w-[22ch]")}>{title}</Heading>}
      {lede && <p className="text-lede mt-5 max-w-[56ch] text-ink-2">{lede}</p>}
      {children && <div className={cn(title || lede ? "mt-10 md:mt-14" : "")}>{children}</div>}
    </section>
  );
}
