"use client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Image from "next/image";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Icon } from "@/components/icon";

const NAMES: Record<string, string> = { en: "English", fr: "Français" };

export function LanguageMenu({ label }: { label: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="icon-btn" aria-label={`${label}: ${NAMES[locale]}`}>
          <Image src={`/flags/${locale}.svg`} alt="" width={20} height={20} className="h-5 w-5 rounded-full object-cover" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="menu" align="end" sideOffset={8}>
          <DropdownMenu.RadioGroup value={locale} onValueChange={(v) => router.replace(pathname, { locale: v })}>
            {routing.locales.map((l) => (
              <DropdownMenu.RadioItem key={l} value={l} className="menu-item">
                <Image src={`/flags/${l}.svg`} alt="" width={18} height={18} className="h-[18px] w-[18px] rounded-full object-cover" />
                {NAMES[l]}
                <DropdownMenu.ItemIndicator className="ml-auto">
                  <Icon name="i-check" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
