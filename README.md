# VISTASY marketing site

The public website for VISTASY, which turns one daylight selfie into thirteen skin readings, a routine chosen by ingredient evidence, and a verdict on any product. The site explains the app ([my.vistasy.clinic](https://my.vistasy.clinic)), takes invite requests from people and pilot requests from retailers, and runs in English and French. Its canonical address is https://www.vistasy.clinic.

This README is for developers who build, change or launch the site.

## Stack

- Next.js 15 (App Router), React 19 and TypeScript
- Tailwind CSS 4
- next-intl 4 for locale routing and messages
- GSAP 3 (`@gsap/react`, ScrollTrigger, ScrollSmoother, CustomEase) for motion and smooth scrolling
- next-themes for light and dark mode, and the Radix UI dropdown menu for the language menu
- react-hook-form and zod for the contact page forms and the contact API
- pnpm

## Get started

Before you begin, install Node.js 18.18 or later and pnpm.

1. Install the dependencies:

   ```bash
   pnpm install
   ```

2. Create your local environment file, then fill in the values described in [Environment variables](#environment-variables):

   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:

   ```bash
   pnpm dev
   ```

4. Open http://localhost:3000. `/` redirects to `/home`, and the middleware adds the locale, for example `/en/home`.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Starts the development server with Turbopack. |
| `pnpm build` | Builds for production and prerenders every page in both locales. |
| `pnpm start` | Serves the production build. |
| `pnpm lint` | Runs ESLint with the `next/core-web-vitals` and `next/typescript` rules. |
| `pnpm typecheck` | Runs `tsc --noEmit`. |

## Project structure

```text
app/
  [locale]/                 pages: home, how-it-works, retailers, pricing, contact, your-data
    layout.tsx              fonts, theme, nav and footer, page motion, client messages
  api/contact/route.ts      contact endpoint: validates, then forwards upstream
  globals.css               design tokens and component classes
  robots.ts, sitemap.ts, manifest.json
components/                 shared UI; label.tsx, meter.tsx and verdict.tsx replicate the app
  home/                     hero intro, sample read, product-check demo, partner logos
  diagrams/                 SVG diagrams for how-it-works and retailers
  motion/motion-root.tsx    loads lib/motion.ts after first paint
  seo/                      schema.org structured data
lib/
  motion.ts                 page motion: ScrollSmoother, pins, reveals and scroll scenes
  gsap-client.ts            the shared GSAP instance and the "settle" ease
  use-hash-tabs.ts          accessible tabs kept in the URL hash (pricing, contact)
  meta.ts                   per-page metadata with hreflang alternates
i18n/                       next-intl routing, request config and navigation helpers
messages/                   en.json and fr.json
service/contact_service.ts  browser client for /api/contact and the request contract
constants/                  navigation items, app URL and contact e-mail
middleware.ts               locale routing and security headers
public/                     icon sprite (app/icons.svg), images and partner logos
```

`middleware.ts` adds the security headers (HSTS, COOP, `nosniff`, Referrer-Policy, Permissions-Policy and X-Frame-Options) to page responses. Its matcher skips `/api`, `/_next` and files with an extension.

## Design system

Tokens and component classes live in `app/globals.css`, whose header comment records the rules.

- **Tokens:** colors, shadows, radii, easing and spacing are custom properties on `:root`, overridden under `.dark`. `@theme inline` exposes them to Tailwind, so use utilities such as `bg-ground`, `text-ink-2` and `border-rule`, and the type scale from `text-hero` to `text-micro`, rather than raw values.
- **Component classes:** `@layer components` holds the site parts (`.btn`, `.sheet`, `.seg`, `.field`, `.faq`, `.dgm`) and the product UI copied from the app: the dispensing label (`.v-label`), readings and meters (`.reading`, `.meter`), the verdict band (`.verdict-band`), tags and chips.
- **Fonts:** Host Grotesk sets the text and Spline Sans Mono sets measured values only. Both load through `next/font` in `app/[locale]/layout.tsx`.
- **Color:** the brand violet (`--cross`, `--cross-ink`, `--cross-soft`) marks measurement, selection, focus and links. Primary actions are ink (`.btn-primary`), not violet.
- **Theme:** next-themes toggles the `.dark` class and follows the system setting by default.
- **Icons:** `<Icon name="i-…" />` draws from the Phosphor sprite in `public/app/icons.svg`, which the app shares.

## Motion

- **Hero intro:** the headline, lede, invite and note rise in CSS from the first paint and never wait for JavaScript. `components/home/hero-motion.tsx` then plays the sample read (sheet, scan, meters, label). If GSAP hasn't taken over within 1.2 seconds, `html.motion-fallback` shows the read's final state. On screens narrower than 1024 px, the read animates when it scrolls into view.
- **Page motion:** `components/motion/motion-root.tsx` imports `lib/motion.ts` once the browser is idle and runs it again on every route change. It works by data attribute: `data-split` (headings, word by word), `data-scrub-words`, `data-reveal` and `data-reveal="lift"` (blocks and elevated cards), `data-meters`, `data-ticker` (numbers count up), `data-typing`, `data-draw` (lines draw with the scroll), `data-rail`, `data-scrolly` (an anchored panel with steps scrolling past it), `data-stack` (stacking cards), `data-hscroll` (a pinned horizontal journey) and `data-tilt`. Anything already on screen when the page opens doesn't animate, and the hero (`data-intro`) keeps its own intro.
- **Smooth scroll and depth:** GSAP ScrollSmoother runs only on fine pointers (`(hover: hover) and (pointer: fine)`) and only when reduced motion is off. `#smooth-wrapper` and `#smooth-content` live in the layout; the header is fixed outside them. Its effects turn `data-speed="clamp(0.9)"` (behind) and `data-speed="clamp(1.1)"` with `data-lag` (in front) into depth; put them on wrapper elements that nothing else transforms. CSS `position: sticky` does not work inside the smoother, so anchored panels are GSAP pins. The smoother is exposed as `window.__smoother`, so the mobile menu can pause it.
- **Elevation:** five ink-tinted shadow steps (`--e1` to `--e4`, with `--edge` as the top highlight) and the surfaces `.s1` to `.s4`; `.lift` raises an interactive card one step on hover. A showcased object stands in a `.stage` with a `.stage-plane` behind it and a `.contact-shadow` under it.
- **Final state first:** with reduced motion, or without JavaScript, the page shows the server-rendered final state.
- **Accessibility:** fades animate `opacity` only, never `visibility` or `autoAlpha`, so content that hasn't faded in yet stays in the accessibility tree.
- **Leak check:** `html[data-st]` holds the live ScrollTrigger count. A page should show the same count every time you return to it.

## Internationalization

- The locales are `en` (default) and `fr`, set in `i18n/routing.ts`. Every page lives under `app/[locale]/`.
- Copy lives in `messages/en.json` and `messages/fr.json`, which must have the same keys: add, rename or remove a key in both files. To list the keys that only one file has, run the following command. It prints `[]` when the files match:

  ```bash
  node -e 'const f=(o,p="")=>Object.entries(o).flatMap(([k,v])=>v&&typeof v=="object"?f(v,p+k+"."):[p+k]);const e=f(require("./messages/en.json")),r=f(require("./messages/fr.json"));console.log([...e.filter(k=>!r.includes(k)),...r.filter(k=>!e.includes(k))])'
  ```

- French copy puts a no-break space (U+00A0, written ` ` in `fr.json`) before `:`, `;`, `?`, `%` and `€`, and between a number and its unit, as in `9 h` and `150 ml`.
- Only the `NavBar` and `ContactPage` namespaces reach the browser (`CLIENT_NAMESPACES` in `app/[locale]/layout.tsx`). A client component that needs other strings receives them as props from its page, or you add its namespace to that list.

## Environment variables

The contact API reads two server-side variables, both listed in `.env.example`:

| Variable | Purpose |
| --- | --- |
| `CONTACT_API_BASE_URL` | The URL the route forwards each contact request to (POST, JSON). |
| `CONTACT_X_API_KEY` | The key sent to that URL in the `x-api-key` header. |

Without them the site builds and runs, but `POST /api/contact` answers `500` with `server_configuration`.

## Contact API

The invite and pilot forms post to `/api/contact` through `sendContactForm` in `service/contact_service.ts`. That file also holds the request contract and the field limits the route enforces.

- **Request:** `Content-Type: application/json` and the body `{ kind: "invite" | "pilot", email, name?, company?, message? }`.
- **Upstream:** the route sends `{ email, name, message }` to `CONTACT_API_BASE_URL`, with the kind and company folded into the message.
- **Response:** `{ "success": true }`, or `{ "success": false, "error": CODE }` with one of the following stable codes:

| Code | Status | Meaning |
| --- | --- | --- |
| `unsupported_media_type` | 415 | The body isn't JSON. |
| `payload_too_large` | 413 | The body is larger than any valid request. |
| `invalid_payload` | 400 | The body failed validation or couldn't be read. |
| `server_configuration` | 500 | An environment variable is missing. |
| `upstream_error` | 502 | The upstream refused the request or couldn't be reached. |
| `upstream_timeout` | 504 | The upstream didn't answer within 8 seconds. |

The browser gives up after 10 seconds. For every 5xx answer the route writes one JSON log line that names the failure, never the sender or what they wrote.

## Before launch

Resolve these placeholders and open questions before the site goes public:

- [ ] Privacy policy and Terms pages. The forms collect names and e-mail addresses, and `/your-data` is a plain-language summary, not the legal policy.
- [ ] A consented hero face. `public/read/sample-face.png` is a sample cropped from a stock photo.
- [ ] Real product packshots. The images in `public/products/` are placeholders.
- [ ] Confirmed pricing tiers (`PricingPage` in both message files).
- [ ] The evidence grading and the names of all 13 readings. The site names four, with illustrative values.
- [ ] Retailer proof: a pilot result or case study for the retailers page.
- [ ] The wording of the partner relationship (`HomePage.partnersTitle`, "We work with these partners").
- [ ] The address line (`Footer.address`, repeated in `components/seo/json-ld.tsx`).

When you replace an image in `public/`, give it a new file name or allow a day for it to appear. Browsers keep optimized images for `images.minimumCacheTTL` (one day, in `next.config.ts`).
