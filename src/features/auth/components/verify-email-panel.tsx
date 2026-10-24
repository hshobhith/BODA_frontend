"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { useResendVerification, useVerifyEmail } from "@/features/auth/hooks";
import { useAuthStore } from "@/store/auth-store";

export function VerifyEmailPanel() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const verifyEmail = useVerifyEmail();
  const resendVerification = useResendVerification();
  const { mutate: verifyToken } = verifyEmail;

  // Auto-fire exactly once on mount (guarded by a ref, not just the query
  // key, since this is a mutation rather than a query).
  const firedRef = useRef(false);
  useEffect(() => {
    if (firedRef.current || !token) return;
    firedRef.current = true;
    verifyToken({ token });
  }, [token, verifyToken]);

  if (!token) {
    return (
      <>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert className="size-6" />
          </div>
          <CardTitle className="text-2xl">Missing verification link</CardTitle>
          <CardDescription>
            This link is missing its verification token. Use the link from your email, or
            request a new one below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isAuthenticated ? (
            <Button onClick={() => resendVerification.mutate()} disabled={resendVerification.isPending}>
              {resendVerification.isPending ? "Sending..." : "Resend verification email"}
            </Button>
          ) : (
            <Button asChild>
              <Link href={ROUTES.login}>Go to login</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href={ROUTES.home}>Back to home</Link>
          </Button>
        </CardContent>
      </>
    );
  }

  if (verifyEmail.isPending || verifyEmail.isIdle) {
    return (
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <CardDescription>Verifying your email...</CardDescription>
      </CardContent>
    );
  }

  if (verifyEmail.isSuccess) {
    return (
      <>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-6" />
          </div>
          <CardTitle className="text-2xl">Email verified</CardTitle>
          <CardDescription>Your email has been verified. You&apos;re all set.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href={isAuthenticated ? ROUTES.home : ROUTES.login}>
              {isAuthenticated ? "Continue" : "Log in"}
            </Link>
          </Button>
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="size-6" />
        </div>
        <CardTitle className="text-2xl">Verification failed</CardTitle>
        <CardDescription>
          This verification link is invalid or has expired.{" "}
          {isAuthenticated
            ? "Request a new one below."
            : "Log in and request a new one from your account."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isAuthenticated ? (
          <Button onClick={() => resendVerification.mutate()} disabled={resendVerification.isPending}>
            {resendVerification.isPending ? "Sending..." : "Resend verification email"}
          </Button>
        ) : (
          <Button asChild>
            <Link href={ROUTES.login}>Go to login</Link>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link href={ROUTES.home}>Back to home</Link>
        </Button>
      </CardContent>
    </>
  );
}
