import { FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FOOD_TYPE_META, type FoodType } from "@/types/product";

/** The Indian veg/non-veg mark: a coloured dot in a square outline. */
export function FoodTypeMark({ foodType, className }: { foodType: FoodType; className?: string }) {
  const meta = FOOD_TYPE_META[foodType];
  return (
    <span
      role="img"
      aria-label={meta.label}
      title={meta.label}
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-[3px] border-[1.5px] bg-background",
        meta.className,
        className
      )}
    >
      <span className="size-2 rounded-full bg-current" />
    </span>
  );
}

export function PrescriptionBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn("gap-1 bg-sky-500/15 text-sky-700 dark:text-sky-400", className)}
    >
      <FileText className="size-3" />
      Rx · prescription needed
    </Badge>
  );
}
