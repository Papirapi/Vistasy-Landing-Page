import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { NavBarItems, APP_URL, CONTACT_EMAIL } from "@/constants/navbar-items-list";
import { Icon } from "@/components/icon";

export default function Footer() {
  const t = useTranslations("Footer");
  const n = useTranslations("NavBar");
  const year = new Date().getFullYear();
  return (
    <footer className="on-shell bg-shell text-on-shell">
      <div className="mx-auto grid max-w-[75rem] gap-10 px-[var(--gutter)] py-16 md:grid-cols-[1.4fr_1fr_1fr_1.4fr] md:gap-8">
        <div>
          <Link href="/home" aria-label={t("goHome")} className="wordmark">
            <Icon name="i-scan-smiley-fill" className="ico h-[22px] w-[22px] text-lav" />
            VISTASY
          </Link>
          <p className="mt-5 max-w-[32ch] text-sm leading-relaxed text-on-shell-2">{t("note")}</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mt-4 inline-block text-sm font-semibold underline underline-offset-4 decoration-on-shell-2 hover:decoration-on-shell">{CONTACT_EMAIL}</a>
        </div>
        <div>
          <h2 className="text-sm font-bold">{t("linksTitle")}</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-on-shell-2">
            <li><Link href="/home" className="hover:text-on-shell">{n("home")}</Link></li>
            {NavBarItems.map((i) => (
              <li key={i.href}><Link href={i.href} className="hover:text-on-shell">{n(i.title)}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold">{t("appTitle")}</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-on-shell-2">
            <li><a href={APP_URL} className="hover:text-on-shell">{t("app")}</a></li>
            <li><a href={`${APP_URL}/independence.html`} className="hover:text-on-shell">{t("independence")}</a></li>
            <li><a href={`${APP_URL}/methodology.html`} className="hover:text-on-shell">{t("methodology")}</a></li>
          </ul>
        </div>
        <div className="text-sm text-on-shell-2">
          <h2 className="text-sm font-bold text-on-shell">{t("addressTitle")}</h2>
          <p className="mt-4 max-w-[36ch] leading-relaxed">{t("address")}</p>
          <h2 className="mt-6 text-sm font-bold text-on-shell">{t("hoursTitle")}</h2>
          <p className="mt-2">{t("hours")}</p>
        </div>
      </div>
      <div className="border-t border-on-shell/10">
        <p className="mx-auto max-w-[75rem] px-[var(--gutter)] py-5 text-xs text-on-shell-2">
          <span className="num">{year}</span> VISTASY. {t("copyright")}.
        </p>
      </div>
    </footer>
  );
}
