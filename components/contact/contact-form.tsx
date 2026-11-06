"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { CONTACT_LIMITS, sendContactForm } from "@/service/contact_service";
import { useHashTabs } from "@/lib/use-hash-tabs";
import { useTabIndicator } from "@/lib/use-tab-indicator";
import { rememberInvite, useRememberedInvite } from "@/lib/invite-memory";
import { Icon } from "@/components/icon";

type Status = "idle" | "sending" | "sent" | "failed";
const AUDIENCES = ["people", "retailers"] as const;

function useSchemas() {
  const e = useTranslations("ContactPage.errors");
  // "required" is checked first, so an empty field asks for an address instead of calling it invalid
  const email = z.string().min(1, e("emailRequired")).pipe(z.email(e("emailInvalid")));
  // The length limits are the route's (CONTACT_LIMITS). The inputs carry them as maxLength too, so
  // these checks never fire and need no translated message.
  return {
    invite: z.object({
      email,
      message: z.string().max(CONTACT_LIMITS.message).optional(),
    }),
    pilot: z.object({
      name: z.string().min(1, e("nameRequired")).max(CONTACT_LIMITS.name),
      company: z.string().min(1, e("companyRequired")).max(CONTACT_LIMITS.company),
      email,
      message: z.string().max(CONTACT_LIMITS.message).optional(),
    }),
  };
}

// The outcome replaces the form: the confirmation repeats what happens next and where, the failure says
// how to recover. After a submit it takes focus so keyboard and screen-reader users land on it; when it
// only recalls an earlier sign-up (focus=false) it leaves focus alone.
function Outcome({ ok, text, retry, focus = true }: { ok: boolean; text: string; retry?: () => void; focus?: boolean }) {
  const t = useTranslations("ContactPage");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focus) ref.current?.focus();
  }, [focus]);
  return (
    <div ref={ref} tabIndex={-1} role="status" className="ct-outcome flex flex-col items-start gap-3 py-2 outline-none">
      <Icon name={ok ? "i-check-circle-fill" : "i-warning-circle"} className={`ico h-9 w-9 ${ok ? "text-good" : "text-flag"}`} />
      <p className="text-title">{ok ? t("successTitle") : t("errorTitle")}</p>
      <p className="max-w-[44ch] text-ink-2">{text}</p>
      {!ok && retry && (
        <button type="button" className="btn btn-secondary mt-2" onClick={retry}>
          {t("retry")}
        </button>
      )}
    </div>
  );
}

function Submit({ status, label }: { status: Status; label: string }) {
  const t = useTranslations("ContactPage");
  const busy = status === "sending";
  return (
    <button type="submit" className="btn btn-primary btn-lg self-start" disabled={busy} aria-busy={busy}>
      {busy && <Icon name="i-arrow-clockwise" />}
      {busy ? t("sending") : label}
    </button>
  );
}

type ControlProps = { id: string; "aria-invalid": boolean; "aria-describedby": string | undefined };

// A labelled control and its error line. The control gets its id and error wiring from the render prop,
// so the label, the control and the error cannot disagree about ids.
function Field({ id, label, error, children }: { id: string; label: ReactNode; error?: string; children: (control: ControlProps) => ReactNode }) {
  const errorId = `${id}-err`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children({ id, "aria-invalid": !!error, "aria-describedby": error ? errorId : undefined })}
      {error && (
        <span id={errorId} className="err">
          <Icon name="i-warning-circle" className="ico h-4 w-4" />
          {error}
        </span>
      )}
    </div>
  );
}

function InviteRequestForm() {
  const t = useTranslations("ContactPage");
  const { invite } = useSchemas();
  type Fields = z.infer<typeof invite>;
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<Fields>({ resolver: zodResolver(invite), mode: "onTouched" });
  const [status, setStatus] = useState<Status>("idle");
  const remembered = useRememberedInvite(); // an invite already requested elsewhere on the site
  if (status === "sent" || status === "failed")
    return <Outcome ok={status === "sent"} text={status === "sent" ? t("successInvite", { email: getValues("email") }) : t("errorText")} retry={() => setStatus("idle")} />;
  if (remembered) return <Outcome ok focus={false} text={t("successInvite", { email: remembered })} />;
  const onSubmit = async (fields: Fields) => {
    setStatus("sending");
    const ok = await sendContactForm({ kind: "invite", ...fields });
    if (ok) rememberInvite(fields.email);
    setStatus(ok ? "sent" : "failed");
  };
  const messageLabel = (
    <>
      {t("people.message")} <span className="font-normal text-ink-3">{t("people.optional")}</span>
    </>
  );
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <Field id="invite-email" label={t("people.email")} error={errors.email?.message}>
        {(control) => <input {...control} type="email" inputMode="email" autoComplete="email" spellCheck={false} maxLength={CONTACT_LIMITS.email} {...register("email")} />}
      </Field>
      <Field id="invite-message" label={messageLabel} error={errors.message?.message}>
        {(control) => <textarea {...control} rows={3} maxLength={CONTACT_LIMITS.message} {...register("message")} />}
      </Field>
      <Submit status={status} label={t("people.submit")} />
    </form>
  );
}

function PilotForm() {
  const t = useTranslations("ContactPage");
  const { pilot } = useSchemas();
  type Fields = z.infer<typeof pilot>;
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<Fields>({ resolver: zodResolver(pilot), mode: "onTouched" });
  const [status, setStatus] = useState<Status>("idle");
  if (status === "sent" || status === "failed")
    return (
      <Outcome
        ok={status === "sent"}
        text={status === "sent" ? t("successPilot", { name: getValues("name"), email: getValues("email") }) : t("errorText")}
        retry={() => setStatus("idle")}
      />
    );
  const onSubmit = async (fields: Fields) => {
    setStatus("sending");
    setStatus((await sendContactForm({ kind: "pilot", ...fields })) ? "sent" : "failed");
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="pilot-name" label={t("retailers.name")} error={errors.name?.message}>
          {(control) => <input {...control} type="text" autoComplete="name" maxLength={CONTACT_LIMITS.name} {...register("name")} />}
        </Field>
        <Field id="pilot-company" label={t("retailers.company")} error={errors.company?.message}>
          {(control) => <input {...control} type="text" autoComplete="organization" maxLength={CONTACT_LIMITS.company} {...register("company")} />}
        </Field>
      </div>
      <Field id="pilot-email" label={t("retailers.email")} error={errors.email?.message}>
        {(control) => <input {...control} type="email" autoComplete="email" maxLength={CONTACT_LIMITS.email} {...register("email")} />}
      </Field>
      <Field
        id="pilot-message"
        label={
          <>
            {t("retailers.message")} <span className="font-normal text-ink-3">{t("people.optional")}</span>
          </>
        }
        error={errors.message?.message}
      >
        {(control) => <textarea {...control} rows={4} maxLength={CONTACT_LIMITS.message} {...register("message")} />}
      </Field>
      <Submit status={status} label={t("retailers.submit")} />
    </form>
  );
}

// One form at a time, chosen by intent; the URL (#people or #retailers) preselects it. The card is the
// page's anchor (s3, staged by the page); a panel fades up each time it is shown (the page's motion styles).
export function ContactForms() {
  const t = useTranslations("ContactPage");
  const { selected, listProps, tabProps, panelProps } = useHashTabs(AUDIENCES, "c");
  const { list, indicator, ready } = useTabIndicator<HTMLDivElement>(selected);
  return (
    // 16px of padding below 360px: the French tabs need 250px and must fit the card at 320px (WCAG reflow)
    <div className="s3 relative p-4 min-[360px]:p-6 sm:p-9">
      <div {...listProps(t("tabs.label"))} ref={list} data-ind={indicator ? (ready ? "ready" : "init") : undefined} className="seg flex w-full sm:inline-flex sm:w-auto">
        <span aria-hidden="true" className="seg-ind" style={indicator ?? undefined} />
        {AUDIENCES.map((audience) => (
          <button key={audience} {...tabProps(audience)} className="flex-1 !px-3 sm:flex-none sm:!px-[18px]">
            {t(`tabs.${audience}`)}
          </button>
        ))}
      </div>
      {AUDIENCES.map((audience) => (
        <div key={audience} {...panelProps(audience)} className="ct-panel mt-8">
          {/* the selected tab already names the choice, so no second heading (critique round 3) */}
          <p className="mb-8 max-w-[46ch] text-ink-2">{t(`${audience}.text`)}</p>
          {audience === "people" ? <InviteRequestForm /> : <PilotForm />}
        </div>
      ))}
    </div>
  );
}
