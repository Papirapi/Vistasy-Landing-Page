import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { routing } from "@/i18n/routing";
import NavBar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import "../globals.css";

// PP Neue Montreal is a commercial face: licence before launch. Files mirror the app's.
const pp = localFont({
  src: [
    { path: "../fonts/PPNeueMontreal-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/PPNeueMontreal-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/PPNeueMontreal-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-pp",
  display: "swap",
  adjustFontFallback: "Arial",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vistasy.clinic"),
  title: { default: "VISTASY", template: "%s | VISTASY" },
  openGraph: { type: "website", siteName: "VISTASY", images: ["/og-image.png"] },
  twitter: { card: "summary_large_image" },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Only the namespaces client components read; the rest stays on the server.
const CLIENT_NAMESPACES = ["NavBar", "Footer", "ContactPage"];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const all = (await getMessages()) as Record<string, unknown>;
  const messages = Object.fromEntries(CLIENT_NAMESPACES.filter((k) => k in all).map((k) => [k, all[k]]));
  const t = await getTranslations("NavBar");

  return (
    <html lang={locale} dir="ltr" suppressHydrationWarning className={`${pp.variable} ${inter.variable}`}>
      <body className="min-h-dvh bg-ground text-ink">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider messages={messages}>
            <a href="#main" className="skip">{t("skip")}</a>
            <NavBar />
            <main id="main">{children}</main>
            <Footer />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
