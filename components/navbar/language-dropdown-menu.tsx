"use client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Icon } from "@/components/icon";

// Languages by name and code, not by flag (a flag is a country, not a language). Switching keeps the
// hash, so /en/pricing#retailers becomes /fr/pricing#retailers (critique round 3).
const NAMES: Record<string, string> = { en: "English", fr: "Français" };

export function LanguageMenu({ label }: { label: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        {/* the visible "EN" must be part of the accessible name (label-content-name-mismatch) */}
        <button type="button" className="icon-btn lang-btn" aria-label={`${locale.toUpperCase()}, ${label}: ${NAMES[locale]}`}>
          <Icon name="i-globe-hemisphere-west" className="ico h-[18px] w-[18px]" />
          <span aria-hidden="true">{locale.toUpperCase()}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="menu" align="end" sideOffset={8}>
          <DropdownMenu.RadioGroup value={locale} onValueChange={(v) => router.replace(pathname + window.location.hash, { locale: v })}>
            {routing.locales.map((l) => (
              <DropdownMenu.RadioItem key={l} value={l} className="menu-item" lang={l}>
                <span className="w-6 text-micro font-medium text-ink-3">{l.toUpperCase()}</span>
                {NAMES[l]}
                <DropdownMenu.ItemIndicator className="ml-auto">
                  <Icon name="i-check" className="ico h-4 w-4" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
