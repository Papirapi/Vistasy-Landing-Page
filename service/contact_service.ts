// The contract between the contact forms and app/api/contact/route.ts: what a request may hold, how
// long each field may be, and what comes back. Both sides import it, so they cannot drift apart.
// It stays free of zod: the inline invite form on every page imports this module and needs no schema.

export const CONTACT_KINDS = ["invite", "pilot"] as const;
export type ContactKind = (typeof CONTACT_KINDS)[number];

export interface ContactPayload {
  kind: ContactKind;
  email: string;
  name?: string;
  company?: string;
  message?: string;
}

/** The longest value the route accepts for each field, in characters (254 is the longest valid e-mail address). */
export const CONTACT_LIMITS = { email: 254, name: 120, company: 120, message: 2000 } as const;

/** Why a request failed. The codes are stable; the route maps each one to its HTTP status. */
export type ContactErrorCode =
  | "invalid_payload"
  | "payload_too_large"
  | "unsupported_media_type"
  | "server_configuration"
  | "upstream_error"
  | "upstream_timeout";

export type ContactResponse = { success: true } | { success: false; error: ContactErrorCode };

/** How long the route waits for the upstream mail service before it answers `upstream_timeout`. */
export const UPSTREAM_TIMEOUT_MS = 8_000;

// The browser waits longer than the route, so a slow upstream ends with the route's own answer.
const REQUEST_TIMEOUT_MS = UPSTREAM_TIMEOUT_MS + 2_000;

/**
 * Posts a contact request to the route. Resolves true once the request has been passed on, and false
 * on any failure: invalid input, network error, timeout or upstream error. It never rejects.
 */
export async function sendContactForm(payload: ContactPayload): Promise<boolean> {
  // A timer and an AbortController rather than AbortSignal.timeout(), which Safari only has from
  // version 16 while Next.js still builds for Safari 12.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) return false;
    const answer: Partial<ContactResponse> = await res.json();
    return answer.success === true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
