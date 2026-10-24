import { apiClient } from "@/services/api-client";
import type {
  AuthSession,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  GoogleRegisterPayload,
  GoogleSignInResponse,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UpdateMePayload,
  User,
  VerifyEmailPayload,
} from "@/types/auth";

/**
 * Thin wrappers around the known auth + user endpoints. Kept here (rather
 * than inline in components/hooks) so the request shape lives in one place
 * per endpoint. React Query hooks wrapping these live in
 * `features/auth/hooks.ts` — this file is the transport layer only.
 */
export const authService = {
  register: (payload: RegisterPayload) =>
    apiClient.post<AuthSession>("/auth/register", payload).then((r) => r.data),

  login: (payload: LoginPayload) =>
    apiClient.post<AuthSession>("/auth/login", payload).then((r) => r.data),

  /** Exchange a Google ID token for a session (or `isNewUser` for first-timers). */
  googleSignIn: (idToken: string) =>
    apiClient.post<GoogleSignInResponse>("/auth/google", { idToken }).then((r) => r.data),

  /** Second step for a first-time Google sign-in: creates the account and signs it in. */
  googleRegister: (payload: GoogleRegisterPayload) =>
    apiClient.post<AuthSession>("/auth/google/register", payload).then((r) => r.data),

  logout: () => apiClient.post<void>("/auth/logout").then((r) => r.data),

  // Self-service customer -> seller upgrade. Returns a fresh session (same
  // shape as login/register) since the role is embedded in the JWT.
  becomeSeller: () => apiClient.post<AuthSession>("/auth/become-seller").then((r) => r.data),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient.post<void>("/auth/forgot-password", payload).then((r) => r.data),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient.post<void>("/auth/reset-password", payload).then((r) => r.data),

  changePassword: (payload: ChangePasswordPayload) =>
    apiClient.post<void>("/auth/change-password", payload).then((r) => r.data),

  verifyEmail: (payload: VerifyEmailPayload) =>
    apiClient.post<void>("/auth/verify-email", payload).then((r) => r.data),

  // Auth-required, no body — backend resolves the target email from the
  // bearer token attached by the request interceptor.
  resendVerification: () =>
    apiClient.post<void>("/auth/resend-verification").then((r) => r.data),

  getMe: () => apiClient.get<User>("/users/me").then((r) => r.data),

  updateMe: (payload: UpdateMePayload) =>
    apiClient.patch<User>("/users/me", payload).then((r) => r.data),
};
