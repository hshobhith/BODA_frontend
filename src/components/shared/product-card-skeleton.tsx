import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <Card className="w-full">
      <Skeleton className="aspect-square w-full rounded-none" />
      <CardContent className="flex flex-col gap-2 pt-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
      <CardFooter className="bg-transparent p-4 pt-0">
        <Skeleton className="h-5 w-16" />
      </CardFooter>
    </Card>
  );
}
