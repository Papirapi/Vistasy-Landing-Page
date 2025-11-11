import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from 'next-themes'

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Vistasy – AI Skin Diagnosis & Care",
    template: "%s | Vistasy",
  },
  description:
    "AI-powered facial skin diagnosis and personalized product recommendations tailored to your skin type and needs.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-title" content="Vistasy" />
        {/*-- Primary Meta Tags --*/}
        <title>Vistasy – AI Skin Diagnosis & Care</title>
        <meta name="title" content="Vistasy – AI Skin Diagnosis & Care" />
        <meta name="description" content="AI-powered facial skin diagnosis and personalized product recommendations tailored to your skin type and needs." />

        {/*-- Open Graph / Facebook --*/}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vistasy.clinic/" />
        <meta property="og:title" content="Vistasy – AI Skin Diagnosis & Care" />
        <meta property="og:description" content="AI-powered facial skin diagnosis and personalized product recommendations tailored to your skin type and needs." />
        <meta property="og:image" content="https://vistasy.clinic/og-image.png" />

        {/*-- X (Twitter) --*/}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://vistasy.clinic/" />
        <meta property="twitter:title" content="Vistasy – AI Skin Diagnosis & Care" />
        <meta property="twitter:description" content="AI-powered facial skin diagnosis and personalized product recommendations tailored to your skin type and needs." />
        <meta property="twitter:image" content="https://vistasy.clinic/og-image.png" />
      </head>
      <body
        className={`${poppins.variable} antialiased`}
      >

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
