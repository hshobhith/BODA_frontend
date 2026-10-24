import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";

// `/seller` has no content of its own. The seller layout's client-side guard
// still runs for whoever lands on the dashboard.
export default function SellerRootPage() {
  redirect(ROUTES.sellerDashboard);
}
