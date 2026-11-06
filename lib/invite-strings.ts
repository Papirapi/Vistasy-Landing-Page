import { getTranslations } from "next-intl/server";
import type { InviteStrings } from "@/components/invite-form";

// One source for the inline invite's strings, used wherever the invite appears.
export async function inviteStrings(): Promise<InviteStrings> {
  const f = await getTranslations("InviteForm");
  return {
    label: f("label"),
    submit: f("submit"),
    sending: f("sending"),
    required: f("required"),
    invalid: f("invalid"),
    success: f.raw("success") as string, // keeps the {email} slot for the client to fill
    failed: f("failed"),
    retry: f("retry"),
  };
}
