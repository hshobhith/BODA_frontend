"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { useGoogleSignIn } from "@/features/auth/hooks";
import type { GoogleProfile } from "@/types/auth";
import { CompleteRegistrationForm } from "./complete-registration-form";
import { GoogleSignInButton } from "./google-sign-in-button";

const COPY = {
  login: {
    title: "Welcome back",
    description: `Log in to your ${APP_NAME} account with Google.`,
    button: "signin_with",
    switchPrompt: `New to ${APP_NAME}?`,
    switchLabel: "Create an account",
    switchHref: ROUTES.register,
  },
  register: {
    title: "Create your account",
    description: `Join ${APP_NAME} to shop or sell locally. Sign up with your Google account.`,
    button: "signup_with",
    switchPrompt: "Already have an account?",
    switchLabel: "Log in",
    switchHref: ROUTES.login,
  },
} as const;

/**
 * Google-only sign-in for both /auth/login and /auth/register. Either page
 * works for either case: a known Google account is signed straight in, and
 * a first-time one is asked for the remaining sign-up details (step 2).
 */
export function GoogleAuthPanel({ mode }: { mode: "login" | "register" }) {
  const searchParams = useSearchParams();
  const googleSignIn = useGoogleSignIn();
  const [signup, setSignup] = useState<{ idToken: string; profile: GoogleProfile } | null>(null);
  const copy = COPY[mode];

  function handleCredential(idToken: string) {
    googleSignIn.mutate(idToken, {
      onSuccess: (result) => {
        if (result.isNewUser) setSignup({ idToken, profile: result.profile });
      },
    });
  }

  if (signup) {
    return (
      <CompleteRegistrationForm
        idToken={signup.idToken}
        profile={signup.profile}
        // `?role=seller` preselects seller (linked from the /sell page).
        defaultRole={searchParams.get("role") === "seller" ? "seller" : "customer"}
        onStartOver={() => {
          setSignup(null);
          googleSignIn.reset();
        }}
      />
    );
  }

  // Keep ?redirect= / ?role= when switching between login and register.
  const query = searchParams.toString();

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-5">
        <GoogleSignInButton
          onCredential={handleCredential}
          text={copy.button}
          pending={googleSignIn.isPending}
        />
        {googleSignIn.isPending && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Signing you in...
          </p>
        )}
        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href={ROUTES.terms} className="underline hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href={ROUTES.privacy} className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
        <p className="text-center text-sm text-muted-foreground">
          {copy.switchPrompt}{" "}
          <Link
            href={query ? `${copy.switchHref}?${query}` : copy.switchHref}
            className="font-medium text-primary hover:underline"
          >
            {copy.switchLabel}
          </Link>
        </p>
      </CardContent>
    </>
  );
}
