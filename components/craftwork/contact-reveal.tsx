// Contact reveal button, from craftwork.design/components/microkit/contact-reveal-button
// Source: microkit by Henrique Barone (github.com/henriquegpb/microkit), MIT licence. Same anatomy: a
// circular arrow that resolves into a full pill on hover or focus; the accent is VISTASY violet.
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

export function ContactReveal({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("contact-reveal", className)}>
      <span className="contact-reveal-icon" aria-hidden="true">
        <Icon name="i-arrow-right" className="ico h-[18px] w-[18px]" />
      </span>
      <span>{children}</span>
    </Link>
  );
}
