"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { NavBarItems } from "@/constants/navbar-items-list";
import { Icon } from "@/components/icon";
import ThemeSwitcher from "@/components/theme/theme-switcher";
import { LanguageMenu } from "@/components/navbar/language-dropdown-menu";
import { useRememberedInvite } from "@/lib/invite-memory";
import { ExpandingNewsletter } from "@/components/craftwork/expanding-newsletter";
import type { InviteStrings } from "@/components/invite-form";

// the width a justify-between row has left over once its items and their minimum gaps are laid out
function spare(row: HTMLElement | null) {
  if (!row) return Infinity;
  const cs = getComputedStyle(row);
  const items = [...row.children].filter((c) => getComputedStyle(c).display !== "none");
  const used = items.reduce((sum, c) => sum + c.getBoundingClientRect().width, 0);
  const inner = row.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  return inner - used - (parseFloat(cs.columnGap) || 0) * (items.length - 1);
}

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/home" className="wordmark" onClick={onClick}>
      <Icon name="i-vistasy" className="ico h-[15px] w-[26px] text-cross-ink" />
      <span className="wordmark-text">VISTASY</span>
    </Link>
  );
}

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hash, setHash] = useState("");
  const pathname = usePathname();
  const t = useTranslations("NavBar");
  const f = useTranslations("InviteForm");
  const menuBtn = useRef<HTMLButtonElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDivElement>(null);

  // one audience per page: retailers (and the retail tabs of pricing and contact) are offered the pilot call;
  // once someone has asked for an invite, the header stops offering it again (critique round 3)
  const retail = pathname === "/retailers" || ((pathname === "/pricing" || pathname === "/contact") && hash === "#retailers");
  const invited = useRememberedInvite();
  // a sign-up made in the header keeps its confirmation in view until the next page
  const [joined, setJoined] = useState(false);
  // on /contact the button would point at the page itself, so it steps aside there
  const showCta = pathname !== "/contact" && (retail || !invited);
  const cta = retail
    ? { href: "/contact#retailers", label: t("ctaRetail"), short: t("ctaRetailShort") }
    : { href: "/contact", label: t("cta"), short: t("ctaShort") };
  // People are asked for their e-mail right in the header (microkit's expanding newsletter button, opened
  // in place into the invite field); retailers get the pilot call as a link. Phones keep the short link
  // and the menu: an e-mail field does not fit beside the wordmark at 320px.
  const invite: InviteStrings = {
    label: f("label"),
    submit: f("submit"),
    sending: f("sending"),
    required: f("required"),
    invalid: f("invalid"),
    success: f.raw("success") as string,
    failed: f("failed"),
    retry: f("retry"),
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onHash = () => setHash(window.location.hash);
    onScroll();
    onHash();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onHash);
    };
  }, [pathname]);

  // close on route change; a header sign-up's confirmation stays on its own page only
  useEffect(() => {
    setOpen(false);
    setJoined(false);
  }, [pathname]);

  // the open menu is modal: scroll locked, Escape closes, Tab stays inside, focus returns to the button
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.key !== "Tab" || !dialog.current) return;
      const f = dialog.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    window.__smoother?.paused(true);
    const btn = menuBtn.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      window.__smoother?.paused(false);
      btn?.focus();
    };
  }, [open]);

  return (
    <header className="site-nav" data-scrolled={scrolled}>
      <div ref={row} className="wrap flex h-full items-center justify-between gap-4">
        <Wordmark />
        <nav className="hidden items-center gap-1 lg:flex" aria-label={t("primary")}>
          {NavBarItems.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} className="nav-link">
              {t(item.title)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-1 lg:flex">
            <LanguageMenu label={t("language")} />
            <ThemeSwitcher label={t("theme")} />
          </div>
          {/* the action stays in reach on phones too; a shorter label where space is tight */}
          {showCta && retail && (
            <Link href={cta.href} className="btn btn-primary btn-sm lg:ml-2">
              <span className="sm:hidden">{cta.short}</span>
              <span className="hidden sm:inline">{cta.label}</span>
            </Link>
          )}
          {showCta && !retail && (
            <Link href={cta.href} className="btn btn-primary btn-sm sm:hidden">
              {cta.short}
            </Link>
          )}
          {!retail && pathname !== "/contact" && (!invited || joined) && (
            <ExpandingNewsletter className="hidden sm:block lg:ml-2" label={cta.label} done={t("ctaDone")} strings={invite} onDone={() => setJoined(true)} room={() => spare(row.current)} />
          )}
          <button ref={menuBtn} type="button" className="icon-btn ml-1 lg:hidden" aria-label={t("menu")} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}>
            <Icon name="i-equals" />
          </button>
        </div>
      </div>

      {/* portalled to <body>: a filtered header would otherwise trap a fixed overlay inside its 72px */}
      {open &&
        createPortal(
          <div ref={dialog} id="mobile-menu" className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ground lg:hidden" role="dialog" aria-modal="true" aria-label={t("menu")}>
            <div className="wrap flex h-[var(--nav-h)] flex-none items-center justify-between">
              <Wordmark onClick={() => setOpen(false)} />
              <button type="button" className="icon-btn" aria-label={t("close")} onClick={() => setOpen(false)} autoFocus>
                <Icon name="i-x" />
              </button>
            </div>
            <nav className="wrap mt-4 flex flex-col" aria-label={t("primary")}>
              {[{ title: "home", href: "/home" } as const, ...NavBarItems].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className="text-headline flex min-h-[64px] items-center justify-between border-b border-rule aria-[current=page]:text-cross-ink"
                >
                  {t(item.title)}
                  <Icon name="i-arrow-right" className="ico h-5 w-5 text-ink-3" />
                </Link>
              ))}
            </nav>
            <div className="wrap mt-auto flex flex-col gap-4 pt-8 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center gap-2">
                <LanguageMenu label={t("language")} />
                <ThemeSwitcher label={t("theme")} />
              </div>
              {showCta && (
                <Link href={cta.href} onClick={() => setOpen(false)} className="btn btn-primary btn-lg w-full">
                  {cta.label}
                </Link>
              )}
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
