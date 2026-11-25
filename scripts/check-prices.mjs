// Checks that every price the site shows matches constants/paddle-catalog.json, in English and French.
//   pnpm check:prices            report blanks, fail on any mismatch
//   pnpm check:prices --strict   also fail while a price or Paddle ID is still blank (run before verification)
import { readFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync(new URL("../constants/paddle-catalog.json", import.meta.url)));
const messages = Object.fromEntries(["en", "fr"].map((l) => [l, JSON.parse(readFileSync(new URL(`../messages/${l}.json`, import.meta.url)))]));
const strict = process.argv.includes("--strict");
const get = (obj, key) => key.split(".").reduce((o, k) => o?.[k], obj);

// 4.99 -> "4.99" (en) or "4,99" (fr); 290 -> "290"; the symbol may follow after a space or a non-breaking space
const shown = (amount, locale) => {
  const s = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return locale === "fr" ? s.replace(".", ",") : s;
};

let errors = 0;
let blanks = 0;
for (const p of catalog.prices) {
  const missing = [p.amount === null && "amount", !p.paddleProductId && "paddleProductId", !p.paddlePriceId && "paddlePriceId"].filter(Boolean);
  if (missing.length) {
    blanks++;
    console.log(`TODO  ${p.key}: ${missing.join(", ")} not set`);
  }
  if (p.amount === null) continue;
  for (const locale of ["en", "fr"]) {
    const want = shown(p.amount, locale);
    const re = new RegExp(`(^|[^\\d.,])${want.replace(/[.,]/g, "\\$&")}[\\s\\u00a0]?€`);
    for (const key of p.shownIn) {
      const text = get(messages[locale], key);
      if (typeof text !== "string") {
        errors++;
        console.log(`ERROR ${p.key}: ${locale} ${key} does not exist`);
      } else if (!re.test(text)) {
        errors++;
        console.log(`ERROR ${p.key}: ${locale} ${key} should show ${want} € but reads "${text}"`);
      }
    }
  }
}
if (catalog.currency !== "EUR") console.log(`NOTE  catalog currency is ${catalog.currency}; the site shows €`);
console.log(errors ? `${errors} mismatch(es) between the site and the Paddle catalog.` : "Every price set in the catalog matches the site.");
if (blanks) console.log(`${blanks} catalog price(s) still blank.`);
process.exit(errors || (strict && blanks) ? 1 : 0);
