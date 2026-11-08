"use client";

import { usePathname } from "next/navigation";

import { ROUTES } from "@/constants/routes";

/**
 * Hides the marketing footer inside the seller/admin dashboards on phones and
 * tablets, where those screens work like an app (bottom tabs, no site links).
 */
export function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard =
    pathname.startsWith(ROUTES.sellerRoot) || pathname.startsWith(ROUTES.adminRoot);

  return isDashboard ? <div className="max-lg:hidden">{children}</div> : <>{children}</>;
}
