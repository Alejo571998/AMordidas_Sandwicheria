"use client";

import { useActionState, useId, useState } from "react";
import { login, type LoginState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const initialState: LoginState = { error: null, email: "" };

const field =
  "h-12 w-full rounded-md border-[1.5px] border-charcoal/15 bg-white px-4 text-base text-charcoal transition-[border-color,box-shadow] duration-150 " +
  "focus:border-olive-700 focus:shadow-[0_0_0_4px_rgb(92_90_44/0.15)] focus:outline-none";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label htmlFor={`${id}-email`} className="mb-1.5 block text-[0.875rem] font-bold">
          Email
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          defaultValue={state.email}
          required
          aria-describedby={state.error ? errorId : undefined}
          className={field}
        />
      </div>

      <div>
        <label htmlFor={`${id}-password`} className="mb-1.5 block text-[0.875rem] font-bold">
          Contraseña
        </label>
        <div className="relative">
          <input
            id={`${id}-password`}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            aria-describedby={state.error ? errorId : undefined}
            className={`${field} pr-24`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-pressed={showPassword}
            className="absolute top-1/2 right-1.5 h-9 -translate-y-1/2 rounded-full px-3 text-[0.75rem] font-bold text-ink-muted hover:bg-charcoal/6 hover:text-charcoal"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      {state.error ? (
        <p id={errorId} role="alert" className="flex items-start gap-2 rounded-md bg-danger/8 px-3 py-2.5 text-[0.875rem] font-semibold text-danger">
          <Icon name="info" size={18} className="mt-px shrink-0" />
          {state.error}
        </p>
      ) : null}

      <Button type="submit" variant="action" size="lg" className="w-full" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
