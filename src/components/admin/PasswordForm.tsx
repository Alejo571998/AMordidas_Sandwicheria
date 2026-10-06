"use client";

import { useActionState, useId, useState } from "react";
import { changePassword, type PasswordState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PASSWORD_MIN_LENGTH, type PasswordField } from "@/lib/admin/password";
import { cn } from "@/lib/format";

const initialState: PasswordState = { status: "idle", message: null, errors: {} };

const fields: Array<{ name: PasswordField; label: string; autoComplete: string; hint?: string }> = [
  { name: "current", label: "Contraseña actual", autoComplete: "current-password" },
  {
    name: "next",
    label: "Contraseña nueva",
    autoComplete: "new-password",
    hint: `Mínimo ${PASSWORD_MIN_LENGTH} caracteres. Una frase de varias palabras es fácil de recordar y difícil de adivinar.`,
  },
  { name: "confirm", label: "Repetí la contraseña nueva", autoComplete: "new-password" },
];

export function PasswordForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(changePassword, initialState);
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <form action={action} className="mt-6 space-y-5">
      {/* Para que el gestor de contraseñas sepa de qué cuenta es. */}
      <input type="text" name="username" autoComplete="username" value={email} readOnly hidden />

      {fields.map((f) => {
        const error = state.errors[f.name];
        const errorId = `${id}-${f.name}-error`;
        const hintId = `${id}-${f.name}-hint`;
        return (
          <div key={f.name}>
            <label htmlFor={`${id}-${f.name}`} className="mb-1.5 block text-[0.875rem] font-bold">
              {f.label}
            </label>
            <input
              id={`${id}-${f.name}`}
              name={f.name}
              type={visible ? "text" : "password"}
              autoComplete={f.autoComplete}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : f.hint ? hintId : undefined}
              className={cn(
                "h-12 w-full rounded-md border-[1.5px] bg-white px-4 text-base text-charcoal transition-[border-color,box-shadow] duration-150",
                "focus:border-olive-700 focus:shadow-[0_0_0_4px_rgb(92_90_44/0.15)] focus:outline-none",
                error ? "border-danger" : "border-charcoal/15",
              )}
            />
            {error ? (
              <p id={errorId} className="mt-1.5 text-[0.8125rem] font-semibold text-danger">
                {error}
              </p>
            ) : f.hint ? (
              <p id={hintId} className="mt-1.5 text-[0.75rem] text-ink-muted">
                {f.hint}
              </p>
            ) : null}
          </div>
        );
      })}

      <label className="flex min-h-11 w-fit cursor-pointer items-center gap-2 text-[0.875rem] font-semibold">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => setVisible(e.target.checked)}
          className="size-5 accent-olive-600"
        />
        Mostrar contraseñas
      </label>

      {state.message ? (
        <p
          role={state.status === "saved" ? "status" : "alert"}
          className={cn(
            "flex items-start gap-2 rounded-md px-3 py-2.5 text-[0.875rem] font-semibold",
            state.status === "saved" ? "bg-olive-100 text-olive-700" : "bg-danger/8 text-danger",
          )}
        >
          <Icon name={state.status === "saved" ? "check" : "info"} size={18} className="mt-px shrink-0" />
          {state.message}
        </p>
      ) : null}

      <Button type="submit" variant="action" size="lg" className="w-full sm:w-auto" disabled={pending}>
        {pending ? "Cambiando…" : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
