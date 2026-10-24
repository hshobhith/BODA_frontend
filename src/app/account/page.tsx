"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { BecomeSellerCard } from "@/features/auth/components/become-seller-card";
// Password change is switched off while sign-in is Google-only (Google
// accounts have no password). Restore this import and the form below to bring it back.
// import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { ProfileForm } from "@/features/auth/components/profile-form";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useAuthStore } from "@/store/auth-store";

/**
 * Client-side route guard only, for now — proper server-side protection
 * (reading the session in `src/proxy.ts`) is a later pass once the backend
 * team finalizes an SSR-visible auth signal (see the TODO in proxy.ts). This
 * is an acceptable MVP interim: an unauthenticated visitor briefly sees the
 * loading skeleton, then gets bounced to login with a `redirect` back here.
 */
export default function AccountPage() {
  const router = useRouter();
  const hasMounted = useHasMounted();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (hasMounted && !isAuthenticated) {
      router.replace(`${ROUTES.login}?redirect=${encodeURIComponent(ROUTES.account)}`);
    }
  }, [hasMounted, isAuthenticated, router]);

  if (!hasMounted || !isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Account settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile details.
        </p>
      </div>
      {user?.role === "customer" && <BecomeSellerCard />}
      <ProfileForm />
      {/* <ChangePasswordForm /> */}
    </div>
  );
}
