// The site described for AI assistants (llmstxt.org): /llms.txt is the short guide with links, /llms-full.txt the
// whole story in plain text. Both are built from the same English copy the pages show (messages/en.json and
// content/legal.ts), so an assistant never reads a price or a promise the site does not make.
import en from "@/messages/en.json";
import { LEGAL_DOCS } from "@/content/legal";
import { APP_URL, CONTACT_EMAIL, SITE_URL } from "@/constants/navbar-items-list";
import { LEGAL } from "@/constants/legal";

type Faq = { items: Record<string, { q: string; a: string }> };
const url = (path: string) => `${SITE_URL}/en${path}`;
const plain = (s: string) => s.replace(/[ ‑]/g, (c) => (c === "‑" ? "-" : " ")).replace(/<[^>]+>/g, "").trim();
const md = en.Metadata;

const PAGES: [string, string, string][] = [
  ["Home", "/home", md.home.description],
  ["How it works", "/how-it-works", md.howItWorks.description],
  ["For retailers", "/retailers", md.retailers.description],
  ["Pricing", "/pricing", md.pricing.description],
  ["Your data", "/your-data", md.yourData.description],
  ["Contact", "/contact", md.contact.description],
];
const POLICIES: [string, string, string][] = [
  ["Terms of Service", "/terms", md.terms.description],
  ["Privacy Policy", "/privacy", md.privacy.description],
  ["Refund Policy", "/refund-policy", md.refund.description],
];

const facts = () => [
  `- What it is: ${plain(md.home.description)}`,
  `- Who it is for: adults (18+) who want to understand their skin and choose skincare by ingredients, and skincare retailers who want the same read on their product pages, in store or through an API.`,
  `- Independence: products are ranked by ingredients and evidence, never by brand. Ranking is never for sale, brands pay nothing, and there are no ads or affiliate links.`,
  `- Not medical: VISTASY gives cosmetic guidance, not a medical diagnosis, and suggests seeing a dermatologist when a reading calls for it.`,
  `- Privacy: photos are stored in Frankfurt, Germany; the user chooses 30 days or deletion right after scoring; personal data is never sold.`,
  `- Price: ${plain(en.PricingPage.lede)}`,
  `- Availability: invite-only preview, in English and French. App: ${APP_URL}`,
  `- Company: ${LEGAL.entity}, ${en.Footer.address}. Contact: ${CONTACT_EMAIL}`,
];

export function llmsTxt(): string {
  const link = ([name, path, desc]: [string, string, string]) => `- [${name}](${url(path)}): ${plain(desc)}`;
  return [
    "# VISTASY",
    "",
    `> ${plain(en.Footer.tagline)}`,
    "",
    ...facts(),
    "",
    "## Pages",
    "",
    ...PAGES.map(link),
    "",
    "## Policies",
    "",
    ...POLICIES.map(link),
    "",
    "## Optional",
    "",
    `- [Full text for AI assistants](${SITE_URL}/llms-full.txt): every page's key content in one plain-text file`,
    `- [French version of the site](${SITE_URL}/fr/home)`,
    "",
  ].join("\n");
}

export function llmsFullTxt(): string {
  const h = en.HowItWorksPage;
  const steps = Object.entries(h.steps as Record<string, { title: string; text: string }>)
    .filter(([, s]) => s.title && s.text)
    .map(([, s], i) => `${i + 1}. ${plain(s.title)}: ${plain(s.text)}`);
  const p = en.PricingPage;
  const faq = (f: Faq) => Object.values(f.items).flatMap(({ q, a }) => [`Q: ${plain(q)}`, `A: ${plain(a)}`, ""]);
  const rows = Object.values(en.DataPage.rows as Record<string, { title: string; text: string }>).map((r) => `- ${plain(r.title)}: ${plain(r.text)}`);
  const refund = LEGAL_DOCS.en.refund.sections.map((s) => `- ${s.h.replace(/^\d+\.\s*/, "")}: ${s.body.flat().map((b) => plain(b).replaceAll("{email}", CONTACT_EMAIL)).join(" ")}`);
  return [
    llmsTxt().trimEnd(),
    "",
    "---",
    "",
    "## How it works",
    "",
    plain(h.lede),
    "",
    ...steps,
    "",
    "## Pricing",
    "",
    plain(p.lede),
    "",
    `- ${p.people.free.name}: ${plain(p.people.free.price)}. ${plain(p.people.free.text)} Includes: ${["i1", "i2", "i3", "i4"].map((k) => plain(p.people.free[k as "i1"])).join("; ")}.`,
    `- ${p.people.premium.name}: ${plain(p.people.premium.priceMonthly)} ${p.perMonth} (${plain(p.monthlyHint)}). ${plain(p.people.premium.text)} Includes: ${["i1", "i2", "i3", "i4"].map((k) => plain(p.people.premium[k as "i1"])).join("; ")}.`,
    `- Retail ${p.retailers.starter.name}: ${plain(p.retailers.starter.price)} ${p.perMonth}, ${plain(p.retailers.starter.scans)}.`,
    `- Retail ${p.retailers.growth.name}: ${plain(p.retailers.growth.price)} ${p.perMonth}, ${plain(p.retailers.growth.scans)}.`,
    `- Retail ${p.retailers.enterprise.name}: ${plain(p.retailers.enterprise.price)}, ${plain(p.retailers.enterprise.scans)}.`,
    `- ${plain(p.retailers.pilot)}`,
    "",
    "## Your data",
    "",
    ...rows,
    "",
    "## Refunds",
    "",
    ...refund,
    "",
    "## Questions and answers",
    "",
    ...faq(en.HomePage.faq as Faq),
    ...faq(en.PricingPage.faq as Faq),
    ...faq(en.RetailersPage.faq as Faq),
  ].join("\n");
}
