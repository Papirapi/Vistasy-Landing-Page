import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { APP_URL, CONTACT_EMAIL } from "@/constants/navbar-items-list";
import { LEGAL } from "@/constants/legal";
import { Icon } from "@/components/icon";

// A footer shaped by the real links (craftwork): product, trust, company, a way to reach us.
export default function Footer() {
  const t = useTranslations("Footer");
  const n = useTranslations("NavBar");
  const year = new Date().getFullYear();
  const col = "flex flex-col gap-1 text-small";
  const a = "inline-flex min-h-[36px] items-center text-ink-2 transition-colors duration-200 hover:text-ink";

  return (
    <footer className="border-t border-rule">
      <div className="wrap grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-10">
        <div className="max-w-[22rem]">
          <Link href="/home" aria-label={t("goHome")} className="wordmark">
            <Icon name="i-vistasy" className="ico h-[15px] w-[26px] text-cross-ink" />
            VISTASY
          </Link>
          <p className="mt-5 text-small text-ink-2">{t("tagline")}</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="link mt-5 inline-block text-small">
            {CONTACT_EMAIL}
          </a>
        </div>
        <nav aria-label={t("product")}>
          <h2 className="text-micro font-medium text-ink-3">{t("product")}</h2>
          <ul className={`mt-3 ${col}`}>
            <li><Link href="/how-it-works" className={a}>{n("howItWorks")}</Link></li>
            <li><Link href="/pricing" className={a}>{n("pricing")}</Link></li>
            <li><a href={APP_URL} className={a}>{t("app")}</a></li>
          </ul>
        </nav>
        <nav aria-label={t("trust")}>
          <h2 className="text-micro font-medium text-ink-3">{t("trust")}</h2>
          <ul className={`mt-3 ${col}`}>
            <li><Link href="/your-data" className={a}>{t("yourData")}</Link></li>
            <li><a href={`${APP_URL}/independence.html`} className={a}>{t("independence")}</a></li>
            <li><a href={`${APP_URL}/methodology.html`} className={a}>{t("methodology")}</a></li>
            <li><Link href="/terms" className={a}>{t("terms")}</Link></li>
            <li><Link href="/privacy" className={a}>{t("privacy")}</Link></li>
            <li><Link href="/refund-policy" className={a}>{t("refund")}</Link></li>
            <li><Link href="/retailers" className={a}>{n("retailers")}</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="text-micro font-medium text-ink-3">{t("visit")}</h2>
          <address className="mt-4 text-small not-italic leading-relaxed text-ink-2">{t("address")}</address>
          <p className="mt-2 text-small text-ink-2">{t("hours")}</p>
          <Link href="/contact" className="link-arrow mt-2 text-small">
            <span>{n("contact")}</span>
            <Icon name="i-arrow-right" />
          </Link>
        </div>
      </div>
      <div className="border-t border-rule">
        <div className="wrap flex flex-col gap-3 py-6 text-micro text-ink-3 md:flex-row md:items-center md:justify-between">
          <p>
            {/* the registered seller, as on the legal pages: Paddle compares it with the account */}
            © <span className="tnum">{year}</span> {LEGAL.entity}. {t("copyright")}.
          </p>
          {/* the three policies Paddle requires to be public, reachable from every page */}
          <nav aria-label={t("legal")} className="flex flex-wrap gap-x-5 gap-y-1">
            <Link href="/terms" className="hover:text-ink">{t("terms")}</Link>
            <Link href="/privacy" className="hover:text-ink">{t("privacy")}</Link>
            <Link href="/refund-policy" className="hover:text-ink">{t("refund")}</Link>
          </nav>
          <p>{t("note")}</p>
        </div>
      </div>
    </footer>
  );
}
