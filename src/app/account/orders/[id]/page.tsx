"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, XCircle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { OrderItemsTable } from "@/features/orders/components/order-items-table";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { OrderTimeline } from "@/features/orders/components/order-timeline";
import { PrescriptionPanel } from "@/features/orders/components/prescription-panel";
import { useCancelOrder, useDownloadInvoice, useOrder, useOrderTimeline } from "@/features/orders/hooks";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useAuthStore } from "@/store/auth-store";

// Restaurants start cooking once an order is being prepared (mirrors the backend rule).
const CANCELLABLE_STATUSES = new Set(["new", "processing"]);
const RESTAURANT_CANCELLABLE_STATUSES = new Set(["new"]);

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const hasMounted = useHasMounted();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.user?.role);

  const orderQuery = useOrder(params.id);
  const timelineQuery = useOrderTimeline(params.id);
  const cancelOrder = useCancelOrder();
  const downloadInvoice = useDownloadInvoice();

  useEffect(() => {
    if (hasMounted && !isAuthenticated) {
      router.replace(
        `${ROUTES.login}?redirect=${encodeURIComponent(ROUTES.orderDetail(params.id))}`
      );
    }
  }, [hasMounted, isAuthenticated, router, params.id]);

  if (!hasMounted || !isAuthenticated || orderQuery.isLoading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-10">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const order = orderQuery.data;

  if (orderQuery.isError || !order) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-foreground">Order not found</h1>
        <Button onClick={() => router.push(ROUTES.orders)}>Back to orders</Button>
      </div>
    );
  }

  const storeType = order.store.storeType;
  const canCancel = (
    storeType === "restaurant" && role === "customer"
      ? RESTAURANT_CANCELLABLE_STATUSES
      : CANCELLABLE_STATUSES
  ).has(order.status);
  const hasPrescription = !!order.prescriptionStatus && order.prescriptionStatus !== "not_required";

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} storeType={storeType} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed on {new Date(order.placedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>

        {hasPrescription && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Prescription</CardTitle>
            </CardHeader>
            <CardContent>
              <PrescriptionPanel order={order} canReview={role === "seller" || role === "admin"} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Items ({order.items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderItemsTable items={order.items} />
            <div className="mt-4 ml-auto flex w-full max-w-xs flex-col gap-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">&#8377;{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery fee</span>
                <span className="text-foreground">&#8377;{order.deliveryFee.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount</span>
                  <span className="text-foreground">-&#8377;{order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-foreground">
                <span>Total</span>
                <span>&#8377;{order.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {timelineQuery.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <OrderTimeline history={timelineQuery.data ?? []} storeType={storeType} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {order.fulfillmentType === "delivery" ? "Delivery details" : "Pickup details"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p className="font-medium text-foreground">{order.store.name}</p>
            <p className="text-muted-foreground">
              {order.store.addressLine}, {order.store.city}, {order.store.state}{" "}
              {order.store.pincode}
            </p>
            {order.fulfillmentType === "delivery" && order.deliveryAddress && (
              <>
                <p className="mt-2 font-medium text-foreground">Deliver to</p>
                <p className="text-muted-foreground">
                  {order.deliveryAddress.line1}
                  {order.deliveryAddress.line2 ? `, ${order.deliveryAddress.line2}` : ""},{" "}
                  {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
                  {order.deliveryAddress.pincode}
                </p>
              </>
            )}
            <p className="mt-2 text-xs text-muted-foreground">Payment: Cash on Delivery</p>
            {order.customerNote && (
              <p className="mt-2 text-xs text-muted-foreground">Note: {order.customerNote}</p>
            )}
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="gap-2"
          disabled={downloadInvoice.isPending}
          onClick={() => downloadInvoice.mutate({ id: order.id, orderNumber: order.orderNumber })}
        >
          <Download className="size-4" /> Download invoice
        </Button>

        {canCancel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                <XCircle className="size-4" /> Cancel order
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                <AlertDialogDescription>
                  This cannot be undone. Any reserved stock will be released back to the seller.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep order</AlertDialogCancel>
                <AlertDialogAction onClick={() => cancelOrder.cancel(order.id)}>
                  Yes, cancel it
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
