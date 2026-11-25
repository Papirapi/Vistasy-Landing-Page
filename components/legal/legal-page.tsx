import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Split } from "@/components/split";
import { LEGAL } from "@/constants/legal";
import { LEGAL_DOCS, type LegalKey } from "@/content/legal";

const PATHS: Record<LegalKey, string> = { terms: "/terms", privacy: "/privacy", refund: "/refund-policy" };
export const legalPath = (key: LegalKey) => PATHS[key];


// The e-mail address in a sentence becomes a mailto link; everything else is plain text.
function Text({ s }: { s: string }) {
  const parts = s.split(LEGAL.email);
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && (
            <a href={`mailto:${LEGAL.email}`} className="link">
              {LEGAL.email}
            </a>
          )}
        </span>
      ))}
    </>
  );
}

// One reading page for the three policies: the title, the date of the latest version, numbered sections, then
// the other two policies. Static, no motion beyond the kit's heading intro.
export async function LegalPage({ docKey, locale }: { docKey: LegalKey; locale: string }) {
  const doc = (LEGAL_DOCS[locale] ?? LEGAL_DOCS.en)[docKey];
  const t = await getTranslations("Legal");
  // the address as the footer writes it in each language
  const address = (await getTranslations("Footer"))("address");
  const fill = (s: string) => s.replaceAll("{entity}", LEGAL.entity).replaceAll("{address}", address).replaceAll("{email}", LEGAL.email);
  const updated = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(LEGAL.updated));
  const others = (Object.keys(PATHS) as LegalKey[]).filter((k) => k !== docKey);

  return (
    <article aria-labelledby="legal-h">
      <div className="wrap pt-10 pb-[var(--space-section)] md:pt-16">
        <header data-intro="" className="max-w-[44rem]">
          <Split id="legal-h" as="h1" intro text={doc.title} className="text-display" />
          <p className="lede mt-6" data-hero-fade="">
            {fill(doc.lede)}
          </p>
          <p className="mt-4 text-small text-ink-3" data-hero-fade="1">
            {t("updated", { date: updated })}
          </p>
        </header>
        <div className="mt-12 flex max-w-[44rem] flex-col gap-10 md:mt-16">
          {doc.sections.map((sec) => (
            <section key={sec.h} aria-label={sec.h}>
              <h2 className="text-title">{sec.h}</h2>
              <div className="mt-3 flex flex-col gap-3 text-body leading-relaxed text-ink-2">
                {sec.body.map((b, i) =>
                  Array.isArray(b) ? (
                    <ul key={i} className="flex list-disc flex-col gap-2 pl-5 marker:text-ink-4">
                      {b.map((li) => (
                        <li key={li}>
                          <Text s={fill(li)} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p key={i}>
                      <Text s={fill(b)} />
                    </p>
                  )
                )}
              </div>
            </section>
          ))}
        </div>
        <nav aria-label={t("related")} className="mt-16 flex max-w-[44rem] flex-wrap gap-x-6 gap-y-2 border-t border-rule pt-6 text-small">
          {others.map((k) => (
            <Link key={k} href={PATHS[k]} className="link">
              {(LEGAL_DOCS[locale] ?? LEGAL_DOCS.en)[k].title}
            </Link>
          ))}
          <Link href="/your-data" className="link">
            {t("yourData")}
          </Link>
        </nav>
      </div>
    </article>
  );
}
