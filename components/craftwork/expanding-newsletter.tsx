"use client";
// Expanding newsletter button, from craftwork.design/components/microkit/expanding-newsletter-button
// Source: microkit by Henrique Barone (github.com/henriquegpb/microkit, components/interactions/
// expanding-newsletter-button), MIT licence. Same anatomy and timing: a pill with a small circle on its
// left that grows (24 to 32px, 9 to 4px from the edge) while an arrow slides in from the left, over 420ms on
// (0.16, 1, 0.3, 1), and a 0.98 press. Ported changes: VISTASY ink pill and on-shell circle instead of
// orange, the site font, the header's 40px height and its sprite arrow instead of lucide; hover only for a
// fine pointer. The original is a button and nothing more; here it does what its name says. Pressed, the
// pill opens in place into the e-mail field (it widens toward the page while the circle travels across to
// become the send button), validates like the site's other invite forms, sends through sendContactForm,
// remembers the sign-up (lib/invite-memory.ts) and becomes the confirmation. Escape, or leaving it empty,
// folds it back. No <form> exists until it opens, so the page's own forms stay first in the document.
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { sendContactForm } from "@/service/contact_service";
import { rememberInvite } from "@/lib/invite-memory";
import type { InviteStrings } from "@/components/invite-form";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
type Phase = "closed" | "open" | "sent";

export function ExpandingNewsletter({
  label,
  done,
  strings,
  onDone,
  room,
  className,
}: {
  /** the button's label, the site's one name for this action */
  label: string;
  /** the short confirmation shown in the pill; the full sentence (strings.success) is announced */
  done: string;
  strings: InviteStrings;
  /** called once the invite has gone through, before the sign-up is remembered */
  onDone?: () => void;
  /** the free width beside the pill in its row: the field opens up to --enl-open, but never wider than this */
  room?: () => number;
  className?: string;
}) {
  const id = useId();
  const pill = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLElement | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);
  const fromW = useRef(0);
  const refocus = useRef(false);
  const [phase, setPhase] = useState<Phase>("closed");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "failed">("idle");
  const [attempt, setAttempt] = useState(0);
  const [sentEmail, setSentEmail] = useState("");
  const [travel, setTravel] = useState(0);

  const validate = (v: string) => (!v.trim() ? strings.required : EMAIL.test(v.trim()) ? null : strings.invalid);

  const go = useCallback((next: Phase) => {
    fromW.current = pill.current?.offsetWidth ?? 0;
    setPhase(next);
  }, []);

  const open = () => {
    // the circle starts where it sat in the button (its centre 21px from the left) and travels to the send
    // button's place (its centre 20px from the right); the pill's right edge stays put while it widens
    const w = pill.current?.offsetWidth ?? 0;
    setTravel(-(w - 41));
    // the field takes the room the row has spare (a long label in a full header leaves little), never less
    // than the button it replaces
    const spare = room?.() ?? Infinity;
    if (Number.isFinite(spare)) wrap.current?.style.setProperty("--enl-room", `${Math.max(w, w + spare - 8)}px`);
    go("open");
  };

  const close = useCallback(
    (focusButton: boolean) => {
      refocus.current = focusButton;
      setError(null);
      setTouched(false);
      setStatus("idle");
      go("closed");
    },
    [go]
  );

  // The width moves between what each state needs (microkit's 420ms curve, in globals.css): from the width
  // it had to the closed button's, the field's (--enl-open, or the room the row has) or the confirmation's;
  // at rest the closed and sent pills go back to auto, so a late web font can never clip their text.
  // Reduced motion: no transition.
  const first = useRef(true);
  useLayoutEffect(() => {
    const box = pill.current;
    const el = inner.current;
    if (!box || !el) return;
    if (first.current) {
      first.current = false;
      return;
    }
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = `${el.offsetWidth}px`;
    if (still) {
      box.style.width = phase === "open" ? target : "";
      return;
    }
    box.style.width = `${fromW.current}px`;
    void box.offsetWidth;
    box.style.width = target;
  }, [phase]);

  const onTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target === pill.current && e.propertyName === "width" && phase !== "open" && pill.current) pill.current.style.width = "";
  };

  // focus follows the pill: into the field when it opens, back to the button when Escape folds it, onto
  // the confirmation when it is sent (so focus is never dropped on the page)
  useEffect(() => {
    if (phase === "open") input.current?.focus();
    if (phase === "closed" && refocus.current) {
      refocus.current = false;
      button.current?.focus();
    }
    if (phase === "sent") sentRef.current?.focus();
  }, [phase]);

  // focus the field after the error has rendered, so its description is announced with it
  useEffect(() => {
    if (attempt) input.current?.focus();
  }, [attempt]);

  // a press anywhere else folds an empty field back
  useEffect(() => {
    if (phase !== "open") return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node) && !email.trim() && status !== "sending") close(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [phase, email, status, close]);

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
    const address = email.trim();
    const ok = await sendContactForm({ kind: "invite", email: address });
    if (!ok) return setStatus("failed");
    setStatus("idle");
    setSentEmail(address);
    onDone?.();
    go("sent");
    rememberInvite(address);
  }

  const formId = `${id}-form`;
  const errId = `${id}-err`;
  const sending = status === "sending";

  return (
    <div ref={wrap} className={cn("enl-wrap", className)}>
      <div
        ref={pill}
        className="enl"
        data-phase={phase}
        data-invalid={phase === "open" && error ? "" : undefined}
        onTransitionEnd={onTransitionEnd}
      >
        {phase === "closed" && (
          <button ref={(el) => void ((inner.current = el), (button.current = el))} type="button" className="enl-btn" aria-expanded={false} onClick={open}>
            <span className="enl-circle" aria-hidden="true">
              <Icon name="i-arrow-right" />
            </span>
            {label}
          </button>
        )}

        {phase === "open" && (
          <form
            ref={(el) => void (inner.current = el)}
            id={formId}
            noValidate
            onSubmit={submit}
            className="enl-form"
            onKeyDown={(e) => {
              if (e.key === "Escape" && !sending) {
                e.stopPropagation();
                close(true);
              }
            }}
            onBlur={(e) => {
              const next = e.relatedTarget as Node | null;
              if (next && wrap.current?.contains(next)) return;
              if (next && !email.trim() && !sending) close(false);
            }}
          >
            <label htmlFor={`${id}-email`} className="sr-only">
              {strings.label}
            </label>
            <input
              ref={input}
              id={`${id}-email`}
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              enterKeyHint="send"
              spellCheck={false}
              placeholder={strings.label}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched && error) setError(validate(e.target.value));
              }}
              onBlur={(e) => {
                const next = e.relatedTarget as Node | null;
                if (touched && !(next && wrap.current?.contains(next))) setError(validate(email));
              }}
              aria-invalid={!!error}
              aria-describedby={error || status === "failed" ? errId : undefined}
              className="enl-input"
            />
            <button
              type="submit"
              className="enl-circle enl-submit"
              style={{ "--enl-from": `${travel}px` } as React.CSSProperties}
              disabled={sending}
              aria-busy={sending}
              aria-label={sending ? strings.sending : strings.submit}
            >
              <Icon name={sending ? "i-arrow-clockwise" : "i-arrow-right"} />
            </button>
          </form>
        )}

        {phase === "sent" && (
          <div ref={(el) => void ((inner.current = el), (sentRef.current = el))} tabIndex={-1} className="enl-done">
            <span className="enl-circle enl-check" aria-hidden="true">
              <Icon name="i-check" />
            </span>
            <span aria-hidden="true">{done}</span>
          </div>
        )}
      </div>

      {phase === "open" && error && (
        <p id={errId} role="alert" className="enl-tip">
          <Icon name="i-warning-circle" className="ico mt-px h-4 w-4 flex-none" />
          {error}
        </p>
      )}
      {phase === "open" && !error && status === "failed" && (
        <p id={errId} role="alert" className="enl-tip">
          <Icon name="i-warning-circle" className="ico mt-px h-4 w-4 flex-none" />
          <span>
            {strings.failed}{" "}
            <button type="submit" form={formId} className="link text-flag">
              {strings.retry}
            </button>
          </span>
        </p>
      )}
      {/* the confirmation is announced in full; the pill shows its short form */}
      <span role="status" className="sr-only">
        {phase === "sent" ? strings.success.replace("{email}", sentEmail) : ""}
      </span>
    </div>
  );
}
