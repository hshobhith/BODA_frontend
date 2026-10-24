import type { ComponentType } from "react";
import { IndianRupee, Package, ShoppingBag, Store, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminAnalyticsOverview } from "@/types/admin";

function StatCard({
  icon: Icon,
  label,
  value,
  breakdown,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  breakdown?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        {breakdown && <p className="mt-1 text-xs text-muted-foreground">{breakdown}</p>}
      </CardContent>
    </Card>
  );
}

export function AnalyticsCards({ data }: { data: AdminAnalyticsOverview }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        icon={Users}
        label="Users"
        value={data.users.total}
        breakdown={`${data.users.byRole.customer} customers · ${data.users.byRole.seller} sellers`}
      />
      <StatCard
        icon={Store}
        label="Stores"
        value={data.stores.total}
        breakdown={`${data.stores.byType?.retail ?? 0} shops · ${data.stores.byType?.restaurant ?? 0} restaurants · ${data.stores.byType?.pharmacy ?? 0} pharmacies · ${data.stores.byApprovalStatus.pending ?? 0} pending`}
      />
      <StatCard
        icon={Package}
        label="Products"
        value={data.products.total}
        breakdown={`${data.products.byStatus.archived} archived`}
      />
      <StatCard
        icon={ShoppingBag}
        label="Orders"
        value={data.orders.total}
        breakdown={`${data.orders.byStatus.delivered} delivered`}
      />
      <StatCard
        icon={IndianRupee}
        label="Revenue (paid)"
        value={`₹${data.revenue.totalPaid.toFixed(2)}`}
      />
    </div>
  );
}
