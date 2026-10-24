import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthFormSkeleton } from "@/features/auth/components/auth-form-skeleton";
import { GoogleAuthPanel } from "@/features/auth/components/google-auth-panel";
// Email/password login is switched off for now: sign-in is Google-only. To
// bring it back, restore this import and the <LoginForm /> below (the
// backend's POST /auth/login still works).
// import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your BODA account.",
};

export default function LoginPage() {
  // GoogleAuthPanel reads `?redirect=` / `?role=` via useSearchParams, so it
  // needs a Suspense boundary to allow static prerendering of everything else.
  return (
    <Suspense fallback={<AuthFormSkeleton fields={1} />}>
      <GoogleAuthPanel mode="login" />
      {/* <LoginForm /> */}
    </Suspense>
  );
}
