import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
// Password reset is switched off while sign-in is Google-only (Google accounts
// have no password), so this page sends people to the Google login instead.
// To bring it back, restore this import and the render below.
// import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset the password for your BODA account.",
};

export default function ForgotPasswordPage() {
  redirect(ROUTES.login);
  // return <ForgotPasswordForm />;
}
