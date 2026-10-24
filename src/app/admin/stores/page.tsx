import { StoreApprovalTable } from "@/features/admin/components/store-approval-table";

export default function AdminStoresPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Stores</h1>
        <p className="text-sm text-muted-foreground">
          Review pending applications and manage existing stores.
        </p>
      </div>
      <StoreApprovalTable />
    </div>
  );
}
