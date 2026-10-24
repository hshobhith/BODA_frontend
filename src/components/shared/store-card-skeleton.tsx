import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StoreCardSkeleton() {
  return (
    <Card className="w-full">
      <Skeleton className="aspect-video w-full rounded-none" />
      <CardHeader>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </CardHeader>
      <CardFooter className="justify-between bg-transparent p-4 pt-0">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-10" />
      </CardFooter>
    </Card>
  );
}
