import { UserTable } from "@/features/admin/components/user-table";

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground">Manage customers, sellers, and admins.</p>
      </div>
      <UserTable />
    </div>
  );
}
