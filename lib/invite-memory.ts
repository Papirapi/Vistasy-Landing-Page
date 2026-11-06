import { useEffect, useState } from "react";

// Remembers, for this browser tab, that the visitor already asked for an invite, so every invite form,
// the contact page and the header can show that instead of asking again (critique rounds 2 and 3).
const KEY = "vistasy-invite";
const EVENT = "vistasy:invited";

function read(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null; // storage blocked: behave as if nothing was remembered
  }
}

/** Record a successful invite request and tell every listener on the page. */
export function rememberInvite(email: string) {
  try {
    sessionStorage.setItem(KEY, email);
  } catch {}
  window.dispatchEvent(new CustomEvent(EVENT, { detail: email }));
}

/** The e-mail of an invite already requested in this tab, or null. Null on the server and first render. */
export function useRememberedInvite(): string | null {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    setEmail(read());
    const on = (e: Event) => setEmail((e as CustomEvent<string>).detail);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return email;
}
