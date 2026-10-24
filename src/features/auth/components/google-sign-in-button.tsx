"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { GOOGLE_CLIENT_ID } from "@/constants/config";
import { cn } from "@/lib/utils";

const GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

// Just the slice of Google Identity Services (GIS) used here.
interface GoogleCredentialResponse {
  credential: string;
}
interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }): void;
  renderButton(parent: HTMLElement, options: Record<string, string | number>): void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null; // allow a retry on the next mount
      reject(new Error("Could not load Google sign-in"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

// GIS holds a single global config, so initialize once and route its callback
// to whichever button is currently mounted.
let gsiInitialized = false;
let activeCallback: ((credential: string) => void) | null = null;

export type GoogleButtonText = "signin_with" | "signup_with" | "continue_with";

/**
 * Google's own "Sign in with Google" button. Hands the ID token ("credential")
 * to `onCredential`; exchanging it for a BODA session is the caller's job.
 */
export function GoogleSignInButton({
  onCredential,
  text = "continue_with",
  pending = false,
}: {
  onCredential: (credential: string) => void;
  text?: GoogleButtonText;
  /** Blocks further clicks while the credential is being exchanged. */
  pending?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const { resolvedTheme } = useTheme();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    callbackRef.current = onCredential;
  });

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    const callback = (credential: string) => callbackRef.current(credential);

    loadGoogleScript()
      .then(() => {
        const container = containerRef.current;
        const gsi = window.google?.accounts.id;
        if (cancelled || !container || !gsi) return;

        if (!gsiInitialized) {
          gsi.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => activeCallback?.(response.credential),
          });
          gsiInitialized = true;
        }
        activeCallback = callback;

        container.replaceChildren();
        gsi.renderButton(container, {
          type: "standard",
          theme: resolvedTheme === "dark" ? "filled_black" : "outline",
          size: "large",
          shape: "pill",
          text,
          logo_alignment: "center",
          // GIS takes a fixed pixel width (200–400), not a CSS value.
          width: Math.min(400, Math.max(200, container.offsetWidth)),
        });
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      if (activeCallback === callback) activeCallback = null;
    };
  }, [resolvedTheme, text]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Google sign-in isn&apos;t set up</AlertTitle>
        <AlertDescription>
          Set NEXT_PUBLIC_GOOGLE_CLIENT_ID for the web app (and GOOGLE_CLIENT_ID for the API), then
          restart both.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Couldn&apos;t load Google sign-in</AlertTitle>
        <AlertDescription>
          Check your connection or any content blockers, then reload the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative flex min-h-11 w-full justify-center">
      {status === "loading" && <Skeleton className="absolute inset-x-0 h-11 rounded-full" />}
      <div
        ref={containerRef}
        aria-busy={pending}
        className={cn(
          "flex w-full max-w-100 justify-center",
          pending && "pointer-events-none opacity-60"
        )}
      />
    </div>
  );
}
