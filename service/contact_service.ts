export type ContactKind = "invite" | "pilot";

export interface ContactPayload {
  kind: ContactKind;
  email: string;
  name?: string;
  company?: string;
  message?: string;
}

export async function sendContactForm(payload: ContactPayload): Promise<boolean> {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return false;
    const json = await res.json();
    return json.success === true;
  } catch {
    return false;
  }
}
