/**
 * Auth-related types.
 *
 * These shapes are confirmed against the live backend (verified via
 * integration testing) — see AuthSession and `emailVerifiedAt` below, which
 * were both corrected from earlier best-guess versions that didn't match
 * the real API.
 */

export type UserRole = "customer" | "seller" | "admin";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  /** Null/absent until the user clicks the emailed verification link. */
  emailVerifiedAt?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Response payload for POST /auth/login and POST /auth/register (post-unwrap
 * of { success, data }). Tokens are nested under `tokens`, NOT flat on the
 * response (unlike POST /auth/refresh, which returns a flat
 * { accessToken, refreshToken } — see RefreshTokenResponse below).
 */
export interface AuthSession {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/** What Google told the backend about a Google account with no BODA account yet. */
export interface GoogleProfile {
  email: string;
  fullName: string;
  avatarUrl: string | null;
}

/** Response of POST /auth/google: a session for known accounts, else the profile. */
export type GoogleSignInResponse =
  | ({ isNewUser: false } & AuthSession)
  | { isNewUser: true; profile: GoogleProfile };

/** POST /auth/google/register — the sign-up details, minus email/password. */
export interface GoogleRegisterPayload {
  idToken: string;
  fullName: string;
  phone?: string;
  role?: Extract<UserRole, "customer" | "seller">;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: Extract<UserRole, "customer" | "seller">;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyEmailPayload {
  token: string;
}

// POST /auth/resend-verification is auth-required and takes no body — the
// backend resolves the target email from the bearer token's user, so there's
// no payload type for it.

export interface UpdateMePayload {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}
