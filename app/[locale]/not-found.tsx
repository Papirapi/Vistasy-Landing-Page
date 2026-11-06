import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icon";

// A 404 in the visitor's language, inside the site shell (critique round 3): one line, then the three
// places most people were looking for. The message and its links are one card at the top elevation on a
// stage, leaning toward a fine pointer (beui tilt-card anatomy, via the kit's data-tilt); it fades up in
// CSS from the first paint. The h1 stays plain text: its words are read and checked as one line.
export default function NotFound() {
  const t = useTranslations("NotFound");
  const n = useTranslations("NavBar");
  return (
    <section aria-labelledby="nf-h">
      <div className="wrap grid min-h-[72dvh] place-items-center py-[var(--space-tight)]" data-intro="">
        <div className="stage tilt-scene w-full max-w-[40rem]" data-hero-fade="">
          <span aria-hidden="true" className="stage-plane inset-[16px_-10px_-16px_10px] sm:inset-[26px_-26px_-26px_26px]" />
          <span aria-hidden="true" className="contact-shadow" style={{ bottom: "-34px" }} />
          <div data-tilt="3">
            <div className="s3 p-7 sm:p-11">
              <p className="tnum text-small text-ink-3">404</p>
              <h1 id="nf-h" className="mt-3 text-display max-w-[15ch]">
                {t("title")}
              </h1>
              <p className="lede mt-5 max-w-[30rem]">{t("text")}</p>
              <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3">
                <Link href="/home" className="btn btn-primary btn-lg">
                  {t("home")}
                </Link>
                <Link href="/how-it-works" className="link-arrow">
                  <span>{n("howItWorks")}</span>
                  <Icon name="i-arrow-right" />
                </Link>
                <Link href="/contact" className="link-arrow">
                  <span>{n("contact")}</span>
                  <Icon name="i-arrow-right" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
