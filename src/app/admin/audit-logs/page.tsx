import { AuditLogTable } from "@/features/admin/components/audit-log-table";

export default function AdminAuditLogsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Audit log</h1>
        <p className="text-sm text-muted-foreground">
          A record of every sensitive action taken across the platform.
        </p>
      </div>
      <AuditLogTable />
    </div>
  );
}
