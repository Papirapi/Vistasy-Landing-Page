import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/meta";
import { Section } from "@/components/section";
import { Pricing, type Plan } from "@/components/pricing/pricing";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale } = await params;
  return pageMeta(locale, "pricing", "/pricing");
}

export default async function PricingPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("PricingPage");

  const people: Plan[] = [
    { name: t("people.free.name"), price: t("people.free.price"), text: t("people.free.text"), items: ["i1", "i2", "i3", "i4"].map((i) => t(`people.free.${i}`)) },
    { name: t("people.premium.name"), price: t("people.premium.price"), per: t("people.premium.per"), text: t("people.premium.text"), items: ["i1", "i2", "i3", "i4"].map((i) => t(`people.premium.${i}`)), featured: true },
  ];
  const retailers: Plan[] = [
    { name: t("retailers.starter.name"), price: t("retailers.starter.price"), per: t("perMonth"), text: t("retailers.starter.scans"), items: ["i1", "i2", "i3"].map((i) => t(`retailers.starter.${i}`)) },
    { name: t("retailers.growth.name"), price: t("retailers.growth.price"), per: t("perMonth"), text: t("retailers.growth.scans"), items: ["i1", "i2", "i3", "i4"].map((i) => t(`retailers.growth.${i}`)), featured: true },
    { name: t("retailers.enterprise.name"), price: t("retailers.enterprise.price"), text: t("retailers.enterprise.scans"), items: ["i1", "i2", "i3", "i4"].map((i) => t(`retailers.enterprise.${i}`)) },
  ];

  return (
    <Section as="h1" title={t("title")} lede={t("lede")}>
      <Pricing
        tabs={{ people: t("tabPeople"), retailers: t("tabRetailers") }}
        people={people}
        retailers={retailers}
        ctas={{ people: t("people.cta"), retailers: t("retailers.cta") }}
        pilot={t("retailers.pilot")}
      />
    </Section>
  );
}
