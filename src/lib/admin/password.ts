export const PASSWORD_MIN_LENGTH = 10;
/** Límite de bcrypt (Supabase Auth): más de 72 bytes se ignoran sin avisar. */
export const PASSWORD_MAX_BYTES = 72;

export type PasswordField = "current" | "next" | "confirm";
export type PasswordErrors = Partial<Record<PasswordField, string>>;

export interface PasswordChangeInput {
  current: string;
  next: string;
  confirm: string;
}

/** Reglas del cambio de contraseña. Se usan igual en el formulario y en el servidor. */
export function validatePasswordChange({ current, next, confirm }: PasswordChangeInput): PasswordErrors {
  const errors: PasswordErrors = {};
  if (!current) errors.current = "Escribí tu contraseña actual.";

  if (next.length < PASSWORD_MIN_LENGTH) {
    errors.next = `Tiene que tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  } else if (new TextEncoder().encode(next).length > PASSWORD_MAX_BYTES) {
    errors.next = "Es demasiado larga: usá hasta 72 caracteres.";
  } else if (next.trim() !== next) {
    errors.next = "No puede empezar ni terminar con espacios.";
  } else if (current && next === current) {
    errors.next = "Tiene que ser distinta de la actual.";
  }

  if (!errors.next && confirm !== next) errors.confirm = "No coincide con la nueva contraseña.";
  return errors;
}
