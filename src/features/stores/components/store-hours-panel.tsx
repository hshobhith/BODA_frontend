import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StoreWorkingHour } from "@/types/store";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTime(time: string | null | undefined): string {
  if (!time) return "";
  // Expecting "HH:mm" or "HH:mm:ss" — render as a friendly 12-hour time.
  const [hourStr, minuteStr = "00"] = time.split(":");
  const hour = Number(hourStr);
  if (Number.isNaN(hour)) return time;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minuteStr.padStart(2, "0")} ${period}`;
}

interface StoreHoursPanelProps {
  workingHours: StoreWorkingHour[];
  className?: string;
}

/** Renders a store's weekly working hours, highlighting the current day. */
export function StoreHoursPanel({ workingHours, className }: StoreHoursPanelProps) {
  const today = new Date().getDay();
  const byDay = new Map(workingHours.map((wh) => [wh.dayOfWeek, wh]));

  return (
    <div className={cn("flex flex-col gap-2 rounded-lg border border-border p-4", className)}>
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Clock className="size-4" />
        Store hours
      </div>
      <dl className="flex flex-col gap-1.5">
        {DAY_LABELS.map((label, dayIndex) => {
          const hours = byDay.get(dayIndex);
          const isToday = dayIndex === today;
          return (
            <div
              key={label}
              className={cn(
                "flex items-center justify-between rounded-md px-2 py-1 text-sm",
                isToday && "bg-accent font-medium text-accent-foreground"
              )}
            >
              <dt>{label}</dt>
              <dd className="text-right text-muted-foreground data-[today=true]:text-foreground" data-today={isToday}>
                {!hours || hours.isHoliday
                  ? "Closed"
                  : `${formatTime(hours.openTime)} – ${formatTime(hours.closeTime)}${
                      hours.breakStart && hours.breakEnd
                        ? ` (break ${formatTime(hours.breakStart)} – ${formatTime(hours.breakEnd)})`
                        : ""
                    }`}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
