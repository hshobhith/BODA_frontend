"use client";

import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { StoreOnboardingForm } from "@/features/seller/components/store-onboarding-form";

export default function SellerOnboardingPage() {
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Set up your store
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about your business. Your store will need admin approval before it goes live to
          shoppers.
        </p>
      </div>
      <StoreOnboardingForm onSuccess={() => router.push(ROUTES.sellerDashboard)} />
    </div>
  );
}
