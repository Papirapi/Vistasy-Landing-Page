import { NextResponse } from "next/server";
import { z } from "zod";

// Trust boundary: parse before forwarding, cap sizes, never pass the body through untouched.
const Payload = z.object({
  kind: z.enum(["invite", "pilot"]),
  email: z.string().email().max(254),
  name: z.string().max(120).optional(),
  company: z.string().max(120).optional(),
  message: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const parsed = Payload.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: "invalid_payload" }, { status: 400 });
  const { kind, email, name, company, message } = parsed.data;

  const xApiKey = process.env.CONTACT_X_API_KEY;
  const baseURL = process.env.CONTACT_API_BASE_URL;
  if (!xApiKey || !baseURL) return NextResponse.json({ success: false, error: "server_configuration" }, { status: 500 });

  // The upstream expects { email, name, message }; the kind and company ride inside the message.
  const upstream = {
    email,
    name: name ?? (kind === "invite" ? "Invite request" : "Pilot request"),
    message: `[${kind}]${company ? ` ${company}:` : ""} ${message ?? ""}`.trim(),
  };

  try {
    const response = await fetch(baseURL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": xApiKey },
      body: JSON.stringify(upstream),
    });
    if (!response.ok) return NextResponse.json({ success: false }, { status: 502 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 502 });
  }
}
