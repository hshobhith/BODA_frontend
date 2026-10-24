import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthFormSkeleton } from "@/features/auth/components/auth-form-skeleton";
import { GoogleAuthPanel } from "@/features/auth/components/google-auth-panel";
// Email/password registration is switched off for now: sign-up is Google-only
// (first-time Google users fill in the same details in a second step). To
// bring it back, restore this import and the <RegisterForm /> below.
// import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a BODA account to shop or sell locally.",
};

export default function RegisterPage() {
  // GoogleAuthPanel reads `?role=` / `?redirect=` via useSearchParams, so it
  // needs a Suspense boundary to allow static prerendering of everything else.
  return (
    <Suspense fallback={<AuthFormSkeleton fields={1} />}>
      <GoogleAuthPanel mode="register" />
      {/* <RegisterForm /> */}
    </Suspense>
  );
}
