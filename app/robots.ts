import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants/navbar-items-list";

// Search engines and AI assistants are all welcome: the wildcard already allows them, and naming the main
// AI crawlers states it plainly (their operators read robots.txt per user agent). Only the form endpoint is
// closed. The AI-readable summaries live at /llms.txt and /llms-full.txt.
const AI_CRAWLERS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", // OpenAI
  "ClaudeBot", "Claude-SearchBot", "Claude-User", // Anthropic
  "Google-Extended", "GoogleOther", // Google (Gemini)
  "PerplexityBot", "Perplexity-User",
  "Applebot", "Applebot-Extended",
  "Bingbot", "DuckAssistBot", "Meta-ExternalAgent", "MistralAI-User", "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: "/api/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
