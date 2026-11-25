import { llmsTxt } from "@/lib/llms";

// built once at build time, served as plain text (llmstxt.org)
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
