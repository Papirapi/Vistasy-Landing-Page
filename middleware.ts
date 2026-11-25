import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import type { NextRequest } from "next/server";

const nextIntlMiddleware = createMiddleware(routing);

const HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Cross-Origin-Opener-Policy": "same-origin",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-Frame-Options": "SAMEORIGIN",
};

export async function middleware(request: NextRequest) {
  const response = await nextIntlMiddleware(request);
  // "/" goes straight to the visitor's language home in one hop (it used to bounce "/" -> "/home" -> "/en/home")
  const location = response.headers.get("location");
  if (location) {
    const to = new URL(location, request.url);
    if (/^\/(en|fr)\/?$/.test(to.pathname)) {
      to.pathname = `${to.pathname.replace(/\/$/, "")}/home`;
      response.headers.set("location", to.toString());
    }
  }
  for (const [k, v] of Object.entries(HEADERS)) response.headers.set(k, v);
  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
