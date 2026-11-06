import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CONTACT_KINDS,
  CONTACT_LIMITS,
  UPSTREAM_TIMEOUT_MS,
  type ContactErrorCode,
  type ContactPayload,
  type ContactResponse,
} from "@/service/contact_service";

// Trust boundary for the contact forms. The envelope (type, size) is checked before the body is read,
// the body is validated before anything is forwarded, and every failure leaves as a stable error code.
// Upstream details stay in the server log, and the log never holds what people wrote.

const STATUS: Record<ContactErrorCode, number> = {
  invalid_payload: 400,
  payload_too_large: 413,
  unsupported_media_type: 415,
  server_configuration: 500,
  upstream_error: 502,
  upstream_timeout: 504,
};

// The largest body a valid request can have: every field at its limit, every character in its longest
// JSON form (\uXXXX, 6 bytes), plus room for the keys and punctuation. About 16 KB.
const MAX_BODY_BYTES = 6 * Object.values(CONTACT_LIMITS).reduce((sum, limit) => sum + limit, 0) + 1024;

const Payload = z.object({
  kind: z.enum(CONTACT_KINDS),
  email: z.email().max(CONTACT_LIMITS.email),
  name: z.string().max(CONTACT_LIMITS.name).optional(),
  company: z.string().max(CONTACT_LIMITS.company).optional(),
  message: z.string().max(CONTACT_LIMITS.message).optional(),
}) satisfies z.ZodType<ContactPayload>;

export async function POST(req: Request) {
  if (!isJson(req)) return fail("unsupported_media_type");

  const body = await readBody(req);
  if ("error" in body) return fail(body.error);

  const parsed = Payload.safeParse(parseJson(body.text));
  if (!parsed.success) return fail("invalid_payload");

  const apiKey = process.env.CONTACT_X_API_KEY;
  const url = process.env.CONTACT_API_BASE_URL;
  if (!apiKey || !url) return fail("server_configuration");

  return forward(parsed.data, url, apiKey);
}

// Only JSON is accepted. This also stops other sites from posting here through a visitor's browser:
// a cross-origin request can only carry this type after a CORS preflight, which this route never approves.
function isJson(req: Request) {
  const mediaType = req.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  return mediaType === "application/json";
}

// Reads the body as text, refusing more than MAX_BODY_BYTES whatever Content-Length claims.
async function readBody(req: Request): Promise<{ text: string } | { error: ContactErrorCode }> {
  if (Number(req.headers.get("content-length")) > MAX_BODY_BYTES) return { error: "payload_too_large" };
  if (!req.body) return { text: "" };

  const reader = req.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  try {
    for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
      bytes += chunk.value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        return { error: "payload_too_large" };
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
  } catch {
    return { error: "invalid_payload" }; // the upload broke off
  }
  return { text: text + decoder.decode() };
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined; // fails validation like any other wrong shape
  }
}

async function forward({ kind, email, name, company, message }: ContactPayload, url: string, apiKey: string) {
  // The upstream expects { email, name, message }; the kind and company ride inside the message.
  const upstream = {
    email,
    name: name ?? (kind === "invite" ? "Invite request" : "Pilot request"),
    message: `[${kind}]${company ? ` ${company}:` : ""} ${message ?? ""}`.trim(),
  };
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify(upstream),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    await res.body?.cancel().catch(() => undefined); // the reply is never read: free the connection now
    if (!res.ok) return fail("upstream_error", { kind, upstreamStatus: res.status, ms: Date.now() - started });
    return NextResponse.json({ success: true } satisfies ContactResponse);
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    return fail(timedOut ? "upstream_timeout" : "upstream_error", { kind, reason: describe(error), ms: Date.now() - started });
  }
}

// Names a failure without its message, which can contain the upstream URL: the error's name and, for
// network errors, the system code, for example "TypeError:ECONNREFUSED".
function describe(error: unknown): string {
  if (!(error instanceof Error)) return typeof error;
  const code = (error.cause as { code?: unknown } | undefined)?.code;
  return typeof code === "string" ? `${error.name}:${code}` : error.name;
}

// Answers with a stable code and nothing from upstream. A server-side failure (5xx) also writes one JSON
// log line naming what failed, never who wrote or what. Client errors (4xx) are not logged: anyone can
// produce them in any number.
function fail(error: ContactErrorCode, context: Record<string, string | number> = {}) {
  const status = STATUS[error];
  if (status >= 500) console.error(JSON.stringify({ event: "contact_failed", error, status, ...context }));
  return NextResponse.json({ success: false, error } satisfies ContactResponse, { status });
}
