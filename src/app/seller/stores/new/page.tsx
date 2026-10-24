"use client";

import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { StoreOnboardingForm } from "@/features/seller/components/store-onboarding-form";

/** Adds another store for a seller who already has at least one — the
 * `/seller/onboarding` page only ever handles the seller's very first store. */
export default function SellerNewStorePage() {
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Add a new store</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about this store. It&apos;ll need admin approval before it goes live to shoppers,
          same as your other store(s).
        </p>
      </div>
      <StoreOnboardingForm onSuccess={() => router.push(ROUTES.sellerDashboard)} />
    </div>
  );
}
