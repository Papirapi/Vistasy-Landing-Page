import { getTranslations } from "next-intl/server";
import { CONTACT_EMAIL, SITE_URL as SITE } from "@/constants/navbar-items-list";

// schema.org structured data, rendered on the server (no "use client").
// Organization and WebSite belong on the home page (or once in the layout); FaqJsonLd goes next to
// a visible <Faq> and must receive the same items, because FAQ markup has to match what is on the page.
// There is no sameAs: the repo holds no social or directory profile URL yet. Add one only when it exists.

const ORG_ID = `${SITE}/#organization`;
const WEBSITE_ID = `${SITE}/#website`;

// Footer.address in messages/{en,fr}.json, split into the parts schema.org asks for.
// "E1" is read as the unit after the floor; Tunis 1002 is the city and postcode. Keep in step with the footer.
const STREET: Record<string, string> = {
  en: "012 Street of Canada, Building B, 4th Floor, E1",
  fr: "012 Rue du Canada, Bâtiment B, 4e étage, E1",
};

type JsonLdData = Record<string, unknown>;

function JsonLd({ data }: { data: JsonLdData }) {
  // "<" is escaped so a string in the data can never close the script element early.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export async function OrganizationJsonLd({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Footer" });
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": ORG_ID,
        name: "VISTASY",
        url: SITE,
        logo: `${SITE}/icon0.svg`,
        email: CONTACT_EMAIL,
        description: t("tagline"),
        address: {
          "@type": "PostalAddress",
          streetAddress: STREET[locale] ?? STREET.en,
          addressLocality: "Tunis",
          postalCode: "1002",
          addressCountry: "TN",
        },
      }}
    />
  );
}

export async function WebSiteJsonLd({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Metadata.home" });
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: "VISTASY",
        url: SITE,
        inLanguage: locale,
        description: t("description"),
        publisher: { "@id": ORG_ID },
      }}
    />
  );
}

export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  if (items.length === 0) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      }}
    />
  );
}
