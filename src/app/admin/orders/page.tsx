import { AdminOrderTable } from "@/features/admin/components/admin-order-table";

export default function AdminOrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground">Platform-wide order oversight.</p>
      </div>
      <AdminOrderTable />
    </div>
  );
}
