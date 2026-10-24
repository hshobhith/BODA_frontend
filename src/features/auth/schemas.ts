import { z } from "zod";

import {
  changePasswordSchema,
  emailSchema,
  forgotPasswordSchema,
  googleRegisterSchema,
  loginSchema,
  passwordSchema,
  phoneSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validators/auth";

/**
 * Feature-local schema surface for `features/auth`. The actual rules live in
 * `lib/validators/auth.ts` (shared across the app, e.g. an admin "invite
 * user" form could reuse `passwordSchema` later) — this file re-exports them
 * under the names the auth pages/hooks import, and adds the one schema that
 * is genuinely specific to this feature (profile updates), so components
 * only ever need to import from `@/features/auth/schemas`.
 */
export {
  changePasswordSchema,
  forgotPasswordSchema,
  googleRegisterSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
};
export type {
  ChangePasswordFormValues,
  ForgotPasswordFormValues,
  GoogleRegisterFormValues,
  LoginFormValues,
  RegisterFormValues,
  ResetPasswordFormValues,
} from "@/lib/validators/auth";

/** Profile section of the account settings page (PATCH /users/me). */
export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: phoneSchema,
  avatarUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
});
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

// Re-exported for any consumer that wants the primitive rules directly
// (e.g. a password-strength meter) without reaching into `lib/validators`.
export { emailSchema, passwordSchema };
