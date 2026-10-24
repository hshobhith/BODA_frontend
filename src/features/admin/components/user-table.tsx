"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminUsers,
  useChangeUserRole,
  useDeleteUser,
  useSuspendUser,
  useUnsuspendUser,
} from "../hooks";
import type { AdminUser } from "@/types/admin";

const ROLE_TABS: { value: "all" | AdminUser["role"]; label: string }[] = [
  { value: "all", label: "All" },
  { value: "customer", label: "Customers" },
  { value: "seller", label: "Sellers" },
  { value: "admin", label: "Admins" },
];

const ALL_ROLES: AdminUser["role"][] = ["customer", "seller", "admin"];

interface PendingRoleChange {
  user: AdminUser;
  role: AdminUser["role"];
}

export function UserTable() {
  const [role, setRole] = useState<"all" | AdminUser["role"]>("all");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<PendingRoleChange | null>(null);

  const usersQuery = useAdminUsers({ role: role === "all" ? undefined : role, page, limit: 10 });
  const suspend = useSuspendUser();
  const unsuspend = useUnsuspendUser();
  const remove = useDeleteUser();
  const changeRole = useChangeUserRole();

  function requestRoleChange(user: AdminUser, newRole: AdminUser["role"]) {
    // Granting admin is the one direction worth a confirmation click — every
    // other role change (customer <-> seller) is low-stakes and immediate,
    // matching the suspend/unsuspend pattern below.
    if (newRole === "admin") {
      setPendingRoleChange({ user, role: newRole });
      return;
    }
    changeRole.mutate({ id: user.id, role: newRole });
  }

  const users = usersQuery.data?.data ?? [];
  const meta = usersQuery.data?.meta;

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={role}
        onValueChange={(value) => {
          setRole(value as typeof role);
          setPage(1);
        }}
      >
        <TabsList>
          {ROLE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {usersQuery.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-foreground">{user.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "secondary" : "destructive"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="User actions">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.status === "active" ? (
                          <DropdownMenuItem onClick={() => suspend.mutate(user.id)}>
                            Suspend
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => unsuspend.mutate(user.id)}>
                            Unsuspend
                          </DropdownMenuItem>
                        )}
                        {ALL_ROLES.filter((r) => r !== user.role).map((r) => (
                          <DropdownMenuItem key={r} onClick={() => requestRoleChange(user, r)}>
                            Make {r}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setPendingDelete(user)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No users found.
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

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.fullName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the user. This can&apos;t be undone. Deleting yourself or
              the last remaining admin is blocked by the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) remove.mutate(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!pendingRoleChange}
        onOpenChange={(open) => !open && setPendingRoleChange(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Make {pendingRoleChange?.user.fullName} an admin?</AlertDialogTitle>
            <AlertDialogDescription>
              This grants full admin access to the platform, including managing every user, store,
              and order. Only do this for someone you trust with that access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingRoleChange) {
                  changeRole.mutate({ id: pendingRoleChange.user.id, role: pendingRoleChange.role });
                }
                setPendingRoleChange(null);
              }}
            >
              Make admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
