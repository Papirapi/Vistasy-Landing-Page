"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { sendContactForm, type ContactKind } from "@/service/contact_service";
import { Icon } from "@/components/icon";

type Status = "idle" | "sending" | "sent" | "failed";

function useSchemas() {
  const e = useTranslations("ContactPage.errors");
  return {
    invite: z.object({
      email: z.string().min(1, e("emailRequired")).email(e("emailInvalid")),
      message: z.string().max(2000).optional(),
    }),
    pilot: z.object({
      name: z.string().min(1, e("nameRequired")).max(120),
      company: z.string().min(1, e("companyRequired")).max(120),
      email: z.string().min(1, e("emailRequired")).email(e("emailInvalid")),
      message: z.string().min(1, e("messageRequired")).max(2000),
    }),
  };
}

function Outcome({ status, retry }: { status: "sent" | "failed"; retry: () => void }) {
  const t = useTranslations("ContactPage");
  const ok = status === "sent";
  return (
    <div role="status" className="flex flex-col items-start gap-3 py-4">
      <Icon name={ok ? "i-check-circle-fill" : "i-warning-circle"} className={`ico h-9 w-9 ${ok ? "text-good" : "text-flag"}`} />
      <p className="text-title">{ok ? t("successTitle") : t("errorTitle")}</p>
      <p className="text-ink-2">{ok ? t("successText") : t("errorText")}</p>
      {!ok && <button type="button" className="btn btn-secondary" onClick={retry}>{t("retry")}</button>}
    </div>
  );
}

function InviteForm() {
  const t = useTranslations("ContactPage");
  const { invite } = useSchemas();
  type F = z.infer<typeof invite>;
  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(invite) });
  const [status, setStatus] = useState<Status>("idle");
  if (status === "sent" || status === "failed") return <Outcome status={status} retry={() => setStatus("idle")} />;
  const onSubmit = async (v: F) => {
    setStatus("sending");
    setStatus((await sendContactForm({ kind: "invite" as ContactKind, ...v })) ? "sent" : "failed");
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="field">
        <label htmlFor="invite-email">{t("people.email")}</label>
        <input id="invite-email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "invite-email-err" : undefined} {...register("email")} />
        {errors.email && <span id="invite-email-err" className="err">{errors.email.message}</span>}
      </div>
      <div className="field">
        <label htmlFor="invite-message">{t("people.message")}</label>
        <textarea id="invite-message" rows={3} {...register("message")} />
      </div>
      <button type="submit" className="btn btn-primary self-start" disabled={status === "sending"}>
        {status === "sending" ? t("sending") : t("people.submit")}
      </button>
    </form>
  );
}

function PilotForm() {
  const t = useTranslations("ContactPage");
  const { pilot } = useSchemas();
  type F = z.infer<typeof pilot>;
  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(pilot) });
  const [status, setStatus] = useState<Status>("idle");
  if (status === "sent" || status === "failed") return <Outcome status={status} retry={() => setStatus("idle")} />;
  const onSubmit = async (v: F) => {
    setStatus("sending");
    setStatus((await sendContactForm({ kind: "pilot" as ContactKind, ...v })) ? "sent" : "failed");
  };
  const field = (name: keyof F, label: string, type = "text", auto?: string) => (
    <div className="field">
      <label htmlFor={`pilot-${name}`}>{label}</label>
      <input id={`pilot-${name}`} type={type} autoComplete={auto} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `pilot-${name}-err` : undefined} {...register(name)} />
      {errors[name] && <span id={`pilot-${name}-err`} className="err">{errors[name]?.message as string}</span>}
    </div>
  );
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {field("name", t("retailers.name"), "text", "name")}
        {field("company", t("retailers.company"), "text", "organization")}
      </div>
      {field("email", t("retailers.email"), "email", "email")}
      <div className="field">
        <label htmlFor="pilot-message">{t("retailers.message")}</label>
        <textarea id="pilot-message" rows={4} aria-invalid={!!errors.message} aria-describedby={errors.message ? "pilot-message-err" : undefined} {...register("message")} />
        {errors.message && <span id="pilot-message-err" className="err">{errors.message.message}</span>}
      </div>
      <button type="submit" className="btn btn-primary self-start" disabled={status === "sending"}>
        {status === "sending" ? t("sending") : t("retailers.submit")}
      </button>
    </form>
  );
}

export function ContactForms() {
  const t = useTranslations("ContactPage");
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div id="people" className="sheet p-7 md:p-9">
        <h2 className="text-title">{t("people.title")}</h2>
        <p className="mt-2 mb-7 text-ink-2">{t("people.text")}</p>
        <InviteForm />
      </div>
      <div id="retailers" className="sheet p-7 md:p-9">
        <h2 className="text-title">{t("retailers.title")}</h2>
        <p className="mt-2 mb-7 text-ink-2">{t("retailers.text")}</p>
        <PilotForm />
      </div>
    </div>
  );
}
