import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"], minimumCacheTTL: 31536000 },
  async redirects() {
    return [
      { source: "/", destination: "/home", permanent: true },
      { source: "/:locale(en|fr)/benefits", destination: "/:locale/how-it-works", permanent: true },
      { source: "/:locale(en|fr)/solution", destination: "/:locale/retailers", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
