import type { Metadata, Viewport } from "next";
import { Host_Grotesk, Spline_Sans_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/constants/navbar-items-list";
import NavBar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { MotionRoot } from "@/components/motion/motion-root";
import { LazyMotionProvider } from "@/components/motion/lazy-motion";
import ScrollProgress from "@/components/craftwork/scroll-progress";
import { Intro } from "@/components/intro/intro";
import "../globals.css";

// Host Grotesk (text and display) + Spline Sans Mono (measured values only); both SIL OFL,
// chosen by eye from a rendered specimen of nine faces. They replace the unlicensed PP Neue Montreal.
const host = Host_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-host", display: "swap" });
const data = Spline_Sans_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-data", display: "swap", weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // the tab reads VISTASY first on every page; the home tab is the name alone (lib/meta.ts)
  title: { default: "VISTASY", template: "VISTASY · %s" },
  openGraph: { type: "website", siteName: "VISTASY", images: ["/og-image.png"] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0e14" },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Only the namespaces client components read; the rest stays on the server.
const CLIENT_NAMESPACES = ["NavBar", "ContactPage", "InviteForm"];

// Marks JS before first paint so the hero intro can start hidden; if GSAP has not taken over
// within 1.2s the fallback class shows everything (see globals.css).
// The opening (components/intro/intro.tsx) is decided here too, before the first paint: the home page, once per
// visit, never under reduced motion or for automated browsers (unless ?intro=1). Phones (coarse pointer),
// Save-Data and 2G/3G connections skip it: the curtain held the largest paint back by about 2.8 s there. Whatever happens to the
// scripts after this, the opening is taken away after 5s, so the page can never stay covered.
const BOOT = [
  "(function(){var c=document.documentElement.classList;c.add('js');",
  "setTimeout(function(){c.add('motion-fallback')},1200);",
  "try{if(/^\\/(en|fr)(\\/home)?\\/?$/.test(location.pathname)&&!sessionStorage.getItem('vis-intro')",
  "&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!matchMedia('(pointer: coarse)').matches",
  "&&!(navigator.connection&&(navigator.connection.saveData||/2g|3g/.test(navigator.connection.effectiveType||'')))",
  "&&(!navigator.webdriver||/[?&]intro=1/.test(location.search))){",
  "c.add('intro-on','intro-hold');setTimeout(function(){c.remove('intro-on','intro-hold')},5000)}}catch(e){}})()",
].join("");

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const all = (await getMessages()) as Record<string, unknown>;
  const messages = Object.fromEntries(CLIENT_NAMESPACES.filter((k) => k in all).map((k) => [k, all[k]]));
  const t = await getTranslations("NavBar");

  return (
    <html lang={locale} dir="ltr" suppressHydrationWarning className={`${host.variable} ${data.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body className="min-h-dvh bg-ground text-ink">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider messages={messages}>
            <LazyMotionProvider>
            <a href="#main" className="skip">
              {t("skip")}
            </a>
            <NavBar />
            {/* the opening, above the header (shown only when the boot script chose to play it) */}
            <Intro />
            {/* Smooth UI scroll progress (craftwork.design): a reading bar on the top edge of every page, fixed
                outside the smoother so it never moves with the content; ornament, hidden from assistive tech */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[45]">
              <ScrollProgress variant="bar" position="inline" thickness={3} decorative />
            </div>
            {/* ScrollSmoother's wrapper (gsap.com/scroll): the fixed header stays outside it */}
            <div id="smooth-wrapper">
              <div id="smooth-content">
                <main id="main">{children}</main>
                <Footer />
              </div>
            </div>
            <MotionRoot />
            </LazyMotionProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
