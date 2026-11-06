import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // A day, not a year. Browsers keep each optimized public/ image for this long (it becomes the
  // Cache-Control max-age) and Next.js cannot invalidate one, while placeholders in public/ are
  // replaced in place before launch.
  images: { formats: ["image/avif", "image/webp"], minimumCacheTTL: 60 * 60 * 24 },
  async redirects() {
    return [
      { source: "/", destination: "/home", permanent: true },
      { source: "/:locale(en|fr)", destination: "/:locale/home", permanent: true },
      { source: "/:locale(en|fr)/benefits", destination: "/:locale/how-it-works", permanent: true },
      { source: "/:locale(en|fr)/solution", destination: "/:locale/retailers", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
