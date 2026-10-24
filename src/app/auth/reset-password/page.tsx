import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
// Password reset is switched off while sign-in is Google-only (Google accounts
// have no password), so this page sends people to the Google login instead.
// To bring it back, restore these imports and the render below.
// import { Suspense } from "react";
// import { AuthFormSkeleton } from "@/features/auth/components/auth-form-skeleton";
// import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your BODA account.",
};

export default function ResetPasswordPage() {
  redirect(ROUTES.login);
  // Reads the `?token=` query param via useSearchParams, so it needs a
  // Suspense boundary to allow static prerendering of everything else.
  // return (
  //   <Suspense fallback={<AuthFormSkeleton fields={2} />}>
  //     <ResetPasswordForm />
  //   </Suspense>
  // );
}
