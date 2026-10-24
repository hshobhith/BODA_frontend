"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, PackageSearch } from "lucide-react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { PrescriptionPanel } from "@/features/orders/components/prescription-panel";
import { useUpdateOrderStatus } from "@/features/orders/hooks";
import { orderStatusLabel, type Order, type OrderStatus } from "@/types/order";
import { useSellerOrders } from "../hooks";

/**
 * Valid forward transitions from a given status, trimmed to what makes sense
 * to surface as a one-tap action here (mirrors the backend's
 * `ORDER_STATUS_FLOW`, without trying to fully replicate its validation —
 * the server has the final say if an unexpected transition is attempted).
 */
function nextStatusOptions(order: Order): OrderStatus[] {
  const isRestaurant = order.store?.storeType === "restaurant";
  switch (order.status) {
    case "new":
      return ["processing", "cancelled"];
    case "processing":
      return ["packed", "cancelled"];
    case "packed":
      if (order.fulfillmentType === "pickup") return ["delivered"];
      // Food goes straight out; "shipped" only makes sense for parcels.
      return isRestaurant ? ["out_for_delivery"] : ["shipped", "out_for_delivery"];
    case "shipped":
      return ["out_for_delivery", "delivered"];
    case "out_for_delivery":
      return ["delivered"];
    default:
      return [];
  }
}

function PrescriptionReviewDialog({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <FileText className="size-4" />
          Review prescription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Prescription for {order.orderNumber}</DialogTitle>
          <DialogDescription>
            {order.items
              .map((item) => `${item.productNameSnapshot} × ${item.quantity}`)
              .join(", ")}
          </DialogDescription>
        </DialogHeader>
        <PrescriptionPanel order={order} canReview onReviewed={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function UpdateStatusControl({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatus();
  const options = nextStatusOptions(order);

  // The backend blocks every move but cancelling until the prescription is checked.
  if (order.prescriptionStatus === "pending_review") {
    return <PrescriptionReviewDialog order={order} />;
  }

  if (options.length === 0) {
    return <span className="text-xs text-muted-foreground">No further action</span>;
  }

  return (
    <Select
      disabled={updateStatus.isPending}
      onValueChange={(value) =>
        updateStatus.mutate({ id: order.id, payload: { status: value as OrderStatus } })
      }
    >
      <SelectTrigger className="w-44" size="sm">
        <SelectValue placeholder="Update status" />
      </SelectTrigger>
      <SelectContent>
        {options.map((status) => (
          <SelectItem key={status} value={status}>
            {orderStatusLabel(status, order.store?.storeType)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface SellerOrderTableProps {
  status?: OrderStatus;
  /** Narrows to one owned store; omitted, orders from every owned store are shown. */
  storeId?: string;
}

/** Orders for the seller's own store(s) — `GET /orders/seller/mine`, with an inline status-advance control. */
export function SellerOrderTable({ status, storeId }: SellerOrderTableProps) {
  const [page, setPage] = useState(1);
  // Reset pagination when the status filter changes. Adjusted during render
  // (the React-docs-sanctioned "storing information from props" pattern)
  // rather than in an effect, so the filtered page never flashes stale data.
  const [prevStatus, setPrevStatus] = useState(status);
  if (status !== prevStatus) {
    setPrevStatus(status);
    setPage(1);
  }

  const ordersQuery = useSellerOrders({ status, page, limit: 10, storeId });
  const orders = ordersQuery.data?.data ?? [];
  const meta = ordersQuery.data?.meta;

  if (ordersQuery.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
        <PackageSearch className="size-10" />
        <p>No orders found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Update</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <p className="font-medium text-foreground">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.placedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </p>
                </TableCell>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-2">
                    {order.customer?.fullName ?? order.guestName ?? "Walk-in customer"}
                    {order.channel === "pos" && (
                      <Badge variant="secondary" className="text-xs">
                        In-store
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">{order.items.length}</TableCell>
                <TableCell className="text-right font-medium text-foreground">
                  ₹{order.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <OrderStatusBadge status={order.status} storeType={order.store?.storeType} />
                    {order.prescriptionStatus && order.prescriptionStatus !== "not_required" && (
                      <Badge variant="outline" className="text-xs">
                        Rx · {order.prescriptionStatus.replace(/_/g, " ")}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <UpdateStatusControl order={order} />
                </TableCell>
                <TableCell>
                  <Link
                    href={ROUTES.orderDetail(order.id)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {meta && meta.totalPages > 1 && (
        <PaginationControls page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
