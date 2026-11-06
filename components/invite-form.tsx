"use client";
import { useEffect, useId, useRef, useState } from "react";
import { sendContactForm } from "@/service/contact_service";
import { rememberInvite, useRememberedInvite } from "@/lib/invite-memory";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

export type InviteStrings = {
  label: string;
  submit: string;
  sending: string;
  required: string;
  invalid: string;
  success: string; // contains {email}
  failed: string;
  retry: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// The invite, inline where the promise is made (critique round 1 + landing-page: one action, no detour).
// microinteractions: validate on submit, then on blur; the error says how to fix it; the button shows
// progress beside its label; the confirmation repeats the address. Once someone has signed up, every
// other invite on the site shows the confirmation instead of asking again (critique round 2).
export function InviteForm({ strings, className, stacked, icon }: { strings: InviteStrings; className?: string; stacked?: boolean; icon?: boolean }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const done = useRememberedInvite();
  // focus the field after the error has rendered, so its description is announced with it (critique round 3)
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (attempt) input.current?.focus();
  }, [attempt]);

  const validate = (v: string) => (!v.trim() ? strings.required : EMAIL.test(v.trim()) ? null : strings.invalid);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    const err = validate(email);
    setError(err);
    if (err) {
      setAttempt((n) => n + 1);
      return;
    }
    setStatus("sending");
    const ok = await sendContactForm({ kind: "invite", email: email.trim() });
    setStatus(ok ? "sent" : "failed");
    if (ok) rememberInvite(email.trim());
  }

  if (done || status === "sent") {
    return (
      <div role="status" className={cn("flex max-w-[34rem] items-start gap-3 rounded-[var(--r-tile)] bg-good-soft p-4", className)}>
        <Icon name="i-check-circle-fill" className="ico mt-0.5 h-5 w-5 text-good" />
        <p className="text-small text-ink">{strings.success.replace("{email}", done ?? email.trim())}</p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className={cn("max-w-[34rem]", className)}>
      <label htmlFor={id} className="text-small font-medium text-ink">
        {strings.label}
      </label>
      <div className={cn("mt-2 flex flex-col gap-2", !stacked && "sm:flex-row")}>
        <input
          ref={input}
          id={id}
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (touched && error) setError(validate(e.target.value));
          }}
          onBlur={() => touched && setError(validate(email))}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className={cn("input h-14 w-full", !stacked && "sm:w-auto sm:flex-1")}
        />
        <button type="submit" className="btn btn-primary btn-lg" disabled={status === "sending"} aria-busy={status === "sending"}>
          {status === "sending" && <Icon name="i-arrow-clockwise" />}
          {status === "sending" ? strings.sending : strings.submit}
          {icon && status !== "sending" && (
            <span className="btn-ic" aria-hidden="true">
              <Icon name="i-arrow-right" />
            </span>
          )}
        </button>
      </div>
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-2 flex items-center gap-1.5 text-micro text-flag">
          <Icon name="i-warning-circle" className="ico h-4 w-4" />
          {error}
        </p>
      )}
      {status === "failed" && (
        <p role="alert" className="mt-2 flex flex-wrap items-center gap-x-2 text-micro text-flag">
          {strings.failed}
          <button type="submit" className="link text-flag">
            {strings.retry}
          </button>
        </p>
      )}
    </form>
  );
}
