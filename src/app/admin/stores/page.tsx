import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants/routes";
import { AdminStoreList } from "@/features/admin/components/admin-store-list";
import { StoreApprovalTable } from "@/features/admin/components/store-approval-table";

export default function AdminStoresPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Stores</h1>
          <p className="text-sm text-muted-foreground">
            Review pending applications, set up stores for sellers, and manage existing stores.
          </p>
        </div>
        <Button asChild>
          <Link href={ROUTES.adminStoreNew}>
            <Plus className="size-4" />
            Add store
          </Link>
        </Button>
      </div>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All stores</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="pt-4">
          <AdminStoreList />
        </TabsContent>
        <TabsContent value="approvals" className="pt-4">
          <StoreApprovalTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
