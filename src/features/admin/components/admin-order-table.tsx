"use client";

import { useState } from "react";
import Link from "next/link";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/constants/routes";
import { Badge } from "@/components/ui/badge";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { useAdminOrders } from "../hooks";
import { ORDER_STATUS_META, type OrderStatus } from "@/types/order";

export function AdminOrderTable() {
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [page, setPage] = useState(1);

  const ordersQuery = useAdminOrders({
    status: status === "all" ? undefined : status,
    page,
    limit: 15,
  });

  const orders = ordersQuery.data?.data ?? [];
  const meta = ordersQuery.data?.meta;

  return (
    <div className="flex flex-col gap-4">
      <Select
        value={status}
        onValueChange={(value) => {
          setStatus(value as OrderStatus | "all");
          setPage(1);
        }}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {Object.entries(ORDER_STATUS_META).map(([value, meta]) => (
            <SelectItem key={value} value={value}>
              {meta.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {ordersQuery.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Placed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={ROUTES.orderDetail(order.id)}
                      className="font-medium text-foreground hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{order.store.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <OrderStatusBadge status={order.status} storeType={order.store?.storeType} />
                      {order.prescriptionStatus === "pending_review" && (
                        <Badge variant="outline" className="text-xs">
                          Rx · awaiting pharmacy
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">&#8377;{order.total.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(order.placedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <PaginationControls page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
