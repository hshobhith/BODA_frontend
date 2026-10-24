"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { ROUTES } from "@/constants/routes";
import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";
import type { ApiError } from "@/types/api";
import type {
  AuthSession,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  GoogleRegisterPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UpdateMePayload,
  UserRole,
  VerifyEmailPayload,
} from "@/types/auth";

/** React Query cache keys for auth-scoped data. */
export const authKeys = {
  me: ["auth", "me"] as const,
};

function errorMessage(error: unknown, fallback: string): string {
  const apiError = error as ApiError | undefined;
  return apiError?.message || fallback;
}

/** Only follow a `?redirect=` query param if it's a same-site relative path. */
function safeRedirectTarget(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return null;
  }
  return raw;
}

/** Where a freshly logged-in user lands absent an explicit `?redirect=`. */
function homeForRole(role: UserRole): string {
  switch (role) {
    case "admin":
      return ROUTES.adminDashboard;
    case "seller":
      return ROUTES.sellerDashboard;
    default:
      return ROUTES.home;
  }
}

function firstName(fullName: string): string {
  return fullName.split(" ")[0];
}

/**
 * Store a fresh session, greet the user, and send them on: to a safe
 * `?redirect=` if present, else `fallback`, else their role's home. Shared by
 * every way of signing in so they all land the same way.
 */
function useStartSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return (session: AuthSession, { message, fallback }: { message: string; fallback?: string }) => {
    setSession(session);
    queryClient.setQueryData(authKeys.me, session.user);
    toast.success(message);
    router.push(
      safeRedirectTarget(searchParams.get("redirect")) ?? fallback ?? homeForRole(session.user.role)
    );
  };
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onError: (error) => {
      toast.error(errorMessage(error, "Registration failed. Please try again."));
    },
  });
}

export function useLogin() {
  const startSession = useStartSession();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (session) => {
      startSession(session, { message: `Welcome back, ${firstName(session.user.fullName)}!` });
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Invalid email or password."));
    },
  });
}

/**
 * Step 1 of Google sign-in. Known accounts are signed in straight away; for a
 * Google account with no BODA account yet the result has `isNewUser: true`
 * and no session — the caller shows the sign-up details step.
 */
export function useGoogleSignIn() {
  const startSession = useStartSession();

  return useMutation({
    mutationFn: (idToken: string) => authService.googleSignIn(idToken),
    onSuccess: (result) => {
      if (!result.isNewUser) {
        startSession(result, { message: `Welcome back, ${firstName(result.user.fullName)}!` });
      }
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Google sign-in failed. Please try again."));
    },
  });
}

/** Step 2 for first-time Google users: create the account, then sign it in. */
export function useGoogleRegister() {
  const startSession = useStartSession();

  return useMutation({
    mutationFn: (payload: GoogleRegisterPayload) => authService.googleRegister(payload),
    onSuccess: (session) => {
      startSession(session, {
        message: `Welcome to BODA, ${firstName(session.user.fullName)}!`,
        // A brand-new seller has no store yet, so go straight to setting one up.
        fallback: session.user.role === "seller" ? ROUTES.sellerOnboarding : ROUTES.home,
      });
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Could not create your account. Please try again."));
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      queryClient.removeQueries({ queryKey: authKeys.me });
      toast.success("You have been logged out.");
      router.push(ROUTES.home);
    },
    onError: (error) => {
      // Even if the server call fails (e.g. the token already expired),
      // clear the local session so the user isn't stuck "logged in" client-side.
      logout();
      queryClient.removeQueries({ queryKey: authKeys.me });
      toast.error(errorMessage(error, "Logout failed, but you've been signed out on this device."));
      router.push(ROUTES.home);
    },
  });
}

export function useBecomeSeller() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: () => authService.becomeSeller(),
    onSuccess: (session) => {
      setSession(session);
      queryClient.setQueryData(authKeys.me, session.user);
      toast.success("You're now a seller! Let's set up your store.");
      router.push(ROUTES.sellerOnboarding);
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Could not upgrade your account. Please try again."));
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authService.forgotPassword(payload),
    onError: (error) => {
      toast.error(errorMessage(error, "Something went wrong. Please try again."));
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authService.resetPassword(payload),
    onSuccess: () => {
      toast.success("Password reset. Please log in with your new password.");
      router.push(ROUTES.login);
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Could not reset your password. The link may have expired."));
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authService.changePassword(payload),
    onSuccess: () => {
      toast.success("Your password has been updated.");
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Could not change your password."));
    },
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VerifyEmailPayload) => authService.verifyEmail(payload),
    onSuccess: () => {
      toast.success("Your email has been verified.");
      queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
    onError: (error) => {
      toast.error(errorMessage(error, "This verification link is invalid or has expired."));
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: () => authService.resendVerification(),
    onSuccess: () => {
      toast.success("Verification email sent. Please check your inbox.");
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Could not resend the verification email."));
    },
  });
}

/** Current authenticated user, kept in sync with the profile PATCH below. */
export function useCurrentUser() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => authService.getMe(),
    enabled: isAuthenticated,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: UpdateMePayload) => authService.updateMe(payload),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(authKeys.me, user);
      toast.success("Your profile has been updated.");
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Could not update your profile."));
    },
  });
}
