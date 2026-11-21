"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useDebounce } from "@/hooks/use-debounce";
import type { AdminStore } from "@/types/admin";
import { STORE_TYPE_META, type StoreApprovalStatus } from "@/types/store";
import { useAdminStores } from "../hooks";

const PAGE_SIZE = 20;
const ALL = "all";

const APPROVAL_OPTIONS: { value: StoreApprovalStatus; label: string }[] = [
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
  { value: "suspended", label: "Suspended" },
];

function ApprovalBadge({ status }: { status?: StoreApprovalStatus }) {
  const variant =
    status === "approved" ? "default" : status === "rejected" || status === "suspended" ? "destructive" : "secondary";
  return (
    <Badge variant={variant} className="capitalize">
      {status ?? "unknown"}
    </Badge>
  );
}

function SellerCell({ seller }: { seller: AdminStore["seller"] }) {
  if (!seller) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="truncate text-foreground">{seller.fullName}</span>
      <span className="truncate text-xs text-muted-foreground">{seller.email}</span>
      {!seller.hasSignedIn && (
        <Badge variant="outline" className="w-fit">
          Hasn&apos;t signed in yet
        </Badge>
      )}
    </div>
  );
}

/** Every store on the platform, any approval status, each with a link to manage it. */
export function AdminStoreList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(ALL);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const storesQuery = useAdminStores({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
    approvalStatus: status === ALL ? undefined : (status as StoreApprovalStatus),
  });
  const stores = storesQuery.data?.data ?? [];
  const meta = storesQuery.data?.meta;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by store name, city or seller email"
            className="pl-8"
            aria-label="Search stores"
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by approval status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {APPROVAL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {storesQuery.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : stores.length === 0 ? (
        <p className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
          No stores match.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="max-w-56">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate font-medium text-foreground">{store.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {STORE_TYPE_META[store.storeType ?? "retail"].label} &middot; {store.city}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-56">
                    <SellerCell seller={store.seller} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <ApprovalBadge status={store.approvalStatus} />
                      <span className="text-xs text-muted-foreground capitalize">
                        {store.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={ROUTES.adminStoreManage(store.id)}>Manage</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {meta && <PaginationControls page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />}
    </div>
  );
}
