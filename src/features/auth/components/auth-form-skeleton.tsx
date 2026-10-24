import { CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Fallback UI for the Suspense boundary that wraps any /auth/* form using
 * `useSearchParams` (login, reset-password, verify-email). Keeps the layout
 * stable between the prerendered shell and the client-rendered form so there
 * is no visible layout shift once the real form mounts.
 */
export function AuthFormSkeleton({ fields = 2 }: { fields?: number }) {
  return (
    <>
      <CardHeader className="items-center gap-2 text-center">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {Array.from({ length: fields }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </>
  );
}
