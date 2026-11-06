import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/meta";
import { CONTACT_EMAIL } from "@/constants/navbar-items-list";
import { Split } from "@/components/split";
import { ContactForms } from "@/components/contact/contact-form";
import { Icon } from "@/components/icon";

// Page motion on the kit's tokens, shipped inside the page (React hoists it into <head>; an imported route
// stylesheet would be preloaded, and warned about, on every page that links here). The form card is set
// down on its stage after the headline, in CSS from the first paint, so the form never waits for
// JavaScript; the details card follows. A tab panel fades up each time it is shown, and the outcome of a
// request fades up in place of the form. Opacity and transform only; reduced motion: none. The form settles
// within 0.8s: a card still moving under the pointer can split a click (ScrollSmoother resets its wrapper on
// focus), so nothing the reader can press keeps moving after the first second.
const MOTION = `@media (prefers-reduced-motion: no-preference) {
  .ct-in { animation: ct-set 0.7s var(--ease-out) 0.1s both; }
  .ct-aside { animation: ct-fade 0.6s var(--ease-out) 0.3s both; }
  .ct-panel, .ct-outcome { animation: ct-fade 0.42s var(--ease-out) both; }
}
@keyframes ct-set { from { opacity: 0; transform: translateY(32px) scale(0.97); } }
@keyframes ct-fade { from { opacity: 0; transform: translateY(12px); } }`;

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  return pageMeta(locale, "contact", "/contact");
}

// Three slots: on phones the form comes right after the headline (critique round 2); on desktop the
// details sit under the headline, their card aligned to the foot of the form beside them.
// The form is the page's anchor: the top elevation, on a stage, with a contact shadow on the page.
export default async function Contact({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ContactPage");
  const f = await getTranslations("Footer");
  return (
    <section aria-labelledby="contact-h">
      <style href="vistasy-contact-motion" precedence="default">
        {MOTION}
      </style>
      <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-12 pt-10 pb-[var(--space-section)] md:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] lg:grid-rows-[auto_1fr] lg:gap-x-20 lg:gap-y-12">
        <div data-intro="">
          <Split id="contact-h" as="h1" intro text={t("title")} className="text-display max-w-[14ch]" />
          <p className="lede mt-6 max-w-[28rem]" data-hero-fade="">
            {t("lede")}
          </p>
        </div>
        <div className="ct-in lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <div className="stage">
            {/* the plane drifts back slower than the page on desktop (ScrollSmoother depth); the shadow stays */}
            <span aria-hidden="true" className="stage-plane inset-[16px_-10px_-16px_10px] sm:inset-[24px_-22px_-24px_22px]" data-speed="clamp(0.92)" />
            <span aria-hidden="true" className="contact-shadow" style={{ bottom: "-34px" }} />
            <ContactForms />
          </div>
        </div>
        <div className="ct-aside lg:self-end">
          <div className="s1 flex flex-col gap-5 p-6 text-small sm:p-7">
            <p className="flex items-start gap-3 text-ink-2">
              <Icon name="i-envelope-simple" className="ico mt-0.5 h-5 w-5 text-ink-3" />
              <span>
                {t("or")}{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="link">
                  {CONTACT_EMAIL}
                </a>
              </span>
            </p>
            <p className="flex items-start gap-3 text-ink-2">
              <Icon name="i-map-pin" className="ico mt-0.5 h-5 w-5 text-ink-3" />
              <span>{f("address")}</span>
            </p>
            <p className="flex items-start gap-3 text-ink-2">
              <Icon name="i-calendar-blank" className="ico mt-0.5 h-5 w-5 text-ink-3" />
              <span>{f("hours")}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
