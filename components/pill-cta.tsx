import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

// The pill that ends in a round arrow, from the app.
export function PillCta({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("pill-cta", className)}>
      <span className="pc-l">{children}</span>
      <span className="pc-r"><Icon name="i-arrow-right" /></span>
    </Link>
  );
}
