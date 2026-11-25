import { getTranslations } from "next-intl/server";
import { APP_URL, CONTACT_EMAIL, SITE_URL as SITE } from "@/constants/navbar-items-list";

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
        // a square raster logo: Google's logo guidelines ask for at least 112 x 112 px
        logo: { "@type": "ImageObject", url: `${SITE}/web-app-manifest-512x512.png`, width: 512, height: 512 },
        image: `${SITE}/og-image.png`,
        email: CONTACT_EMAIL,
        description: t("tagline"),
        slogan: t("tagline"),
        knowsAbout: ["skin analysis", "skincare", "cosmetic ingredients", "INCI ingredient lists", "skincare routines"],
        contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: CONTACT_EMAIL, availableLanguage: ["English", "French"] },
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

// "4.99 €", "4,99 €", "39 €" -> 4.99, 4.99, 39; anything else (a range, "On request") -> undefined
function euros(s: string): number | undefined {
  const m = s.replace(/ /g, " ").match(/^(\d+)(?:[.,](\d{1,2}))?\s*€$/);
  return m ? Number(`${m[1]}.${m[2] ?? "0"}`) : undefined;
}

// The product itself, with its free and paid offers read from the same copy the pricing page shows, so the
// markup can never disagree with the page. Goes on the home and pricing pages.
export async function AppJsonLd({ locale }: { locale: string }) {
  const p = await getTranslations({ locale, namespace: "PricingPage" });
  const home = await getTranslations({ locale, namespace: "HomePage" });
  const meta = await getTranslations({ locale, namespace: "Metadata.home" });
  const offer = (name: string, price: number | undefined, unit?: "MON" | "ANN") =>
    price === undefined
      ? null
      : {
          "@type": "Offer",
          name,
          price: price.toFixed(2),
          priceCurrency: "EUR",
          url: `${SITE}/${locale}/pricing`,
          ...(unit ? { priceSpecification: { "@type": "UnitPriceSpecification", price: price.toFixed(2), priceCurrency: "EUR", unitCode: unit, referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: unit } } } : {}),
        };
  const offers = [
    offer(p("people.free.name"), euros(p("people.free.price"))),
    offer(`${p("people.premium.name")} · ${home("hero.cards.monthly")}`, euros(p("people.premium.priceMonthly")), "MON"),
    offer(`${p("people.premium.name")} · ${home("hero.cards.yearly")}`, euros(home("hero.cards.yearPrice")), "ANN"),
  ].filter(Boolean);
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "@id": `${SITE}/#app`,
        name: "VISTASY",
        url: APP_URL,
        description: meta("description"),
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        browserRequirements: "Requires a camera for the skin scan",
        inLanguage: ["en", "fr"],
        image: `${SITE}/og-image.png`,
        publisher: { "@id": ORG_ID },
        offers,
      }}
    />
  );
}

// Breadcrumbs and the page itself, on every page but the home page. Names are the pages' own titles.
export async function PageJsonLd({ locale, metaKey, path, type = "WebPage" }: { locale: string; metaKey: string; path: string; type?: string }) {
  const t = await getTranslations({ locale, namespace: `Metadata.${metaKey}` });
  const url = `${SITE}/${locale}${path}`;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": type, "@id": `${url}#webpage`, url, name: t("title"), description: t("description"), inLanguage: locale, isPartOf: { "@id": WEBSITE_ID }, publisher: { "@id": ORG_ID } },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "VISTASY", item: `${SITE}/${locale}/home` },
              { "@type": "ListItem", position: 2, name: t("title"), item: url },
            ],
          },
        ],
      }}
    />
  );
}

// The journey as steps, in the order the page's diagram shows them (how-it-works).
export function HowToJsonLd({ name, description, steps, url }: { name: string; description: string; steps: { name: string; text: string }[]; url: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "HowTo",
        name,
        description,
        url,
        step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
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
