import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthFormSkeleton } from "@/features/auth/components/auth-form-skeleton";
import { VerifyEmailPanel } from "@/features/auth/components/verify-email-panel";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Verify the email address for your BODA account.",
};

export default function VerifyEmailPage() {
  // Reads the `?token=` query param via useSearchParams, so it needs a
  // Suspense boundary to allow static prerendering of everything else.
  return (
    <Suspense fallback={<AuthFormSkeleton fields={0} />}>
      <VerifyEmailPanel />
    </Suspense>
  );
}
