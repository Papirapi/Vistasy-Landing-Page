"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { NavBarItems } from "@/constants/navbar-items-list";
import { Icon } from "@/components/icon";
import ThemeSwitcher from "@/components/theme/theme-switcher";
import { LanguageMenu } from "@/components/navbar/language-dropdown-menu";
import { cn } from "@/lib/utils";

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/home" className="wordmark" onClick={onClick}>
      <Icon name="i-scan-smiley-fill" className="ico h-[22px] w-[22px] text-lav" />
      VISTASY
    </Link>
  );
}

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("NavBar");
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="on-shell sticky top-0 z-40 text-on-shell backdrop-blur-sm" style={{ background: "color-mix(in srgb, var(--shell) 94%, transparent)" }}>
      <div className="mx-auto flex h-16 max-w-[75rem] items-center justify-between gap-6 px-[var(--gutter)]">
        <Wordmark />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NavBarItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("text-[.95rem] font-semibold transition-colors", active ? "text-on-shell underline underline-offset-[6px] decoration-lav decoration-2" : "text-on-shell-2 hover:text-on-shell")}
              >
                {t(item.title)}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            <LanguageMenu label={t("language")} />
            <ThemeSwitcher label={t("theme")} />
            <Link href="/contact" className="btn btn-lav ml-2">{t("cta")}</Link>
          </div>
          <button type="button" className="icon-btn lg:hidden" aria-label={open ? t("close") : t("menu")} aria-expanded={open} onClick={() => setOpen(!open)}>
            <Icon name={open ? "i-x" : "i-equals"} />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-shell px-[var(--gutter)] pt-3 lg:hidden" role="dialog" aria-modal="true" aria-label={t("menu")}>
          <div className="flex h-16 items-center justify-between">
            <Wordmark onClick={close} />
            <button type="button" className="icon-btn" aria-label={t("close")} onClick={close} autoFocus>
              <Icon name="i-x" />
            </button>
          </div>
          <nav className="mt-6 flex flex-col" aria-label="Primary">
            {NavBarItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={close} className="border-b border-on-shell/15 py-4 text-[1.6rem] font-bold tracking-[-.02em]">
                {t(item.title)}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-3">
              <LanguageMenu label={t("language")} />
              <ThemeSwitcher label={t("theme")} />
            </div>
            <Link href="/contact" onClick={close} className="btn btn-lav btn-big w-full">{t("cta")}</Link>
          </div>
        </div>
      )}
    </header>
  );
}
