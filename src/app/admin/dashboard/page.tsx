"use client";

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { AnalyticsCards } from "@/features/admin/components/analytics-cards";
import { useAdminAnalytics, useAuditLogs, usePendingStores } from "@/features/admin/hooks";
import { STORE_TYPE_META } from "@/types/store";

export default function AdminDashboardPage() {
  const analyticsQuery = useAdminAnalytics();
  const pendingQuery = usePendingStores({ limit: 5 });
  const logsQuery = useAuditLogs({ limit: 5 });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Admin dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform-wide overview.</p>
      </div>

      {analyticsQuery.isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : analyticsQuery.data ? (
        <AnalyticsCards data={analyticsQuery.data} />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending store approvals</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {pendingQuery.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (pendingQuery.data?.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing pending. 🎉</p>
            ) : (
              (pendingQuery.data?.data ?? []).map((store) => (
                <div key={store.id} className="text-sm">
                  <span className="font-medium text-foreground">{store.name}</span>{" "}
                  <span className="text-muted-foreground">
                    — {STORE_TYPE_META[store.storeType ?? "retail"].label}, {store.city}
                  </span>
                </div>
              ))
            )}
            <Link
              href={ROUTES.adminStores}
              className="mt-2 text-sm font-medium text-primary hover:underline"
            >
              Review all →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {logsQuery.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (logsQuery.data?.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
            ) : (
              (logsQuery.data?.data ?? []).map((log) => (
                <div key={log.id} className="text-sm text-muted-foreground">
                  <span className="font-mono text-xs">{log.action}</span> by{" "}
                  {log.actor?.fullName ?? "system"}
                </div>
              ))
            )}
            <Link
              href={ROUTES.adminAuditLogs}
              className="mt-2 text-sm font-medium text-primary hover:underline"
            >
              View audit log →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
