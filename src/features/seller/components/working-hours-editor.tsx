"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useUpdateWorkingHours, useWorkingHours } from "../hooks";
import { DAY_LABELS, workingHoursSchema, type WorkingHoursFormValues } from "../schemas";
import type { StoreWorkingHour } from "@/types/store";

function seedHours(existing: StoreWorkingHour[] | undefined): WorkingHoursFormValues["hours"] {
  const byDay = new Map((existing ?? []).map((h) => [h.dayOfWeek, h]));
  return Array.from({ length: 7 }, (_, day) => {
    const h = byDay.get(day);
    return {
      dayOfWeek: day,
      openTime: h?.openTime ?? "09:00",
      closeTime: h?.closeTime ?? "18:00",
      breakStart: h?.breakStart ?? "",
      breakEnd: h?.breakEnd ?? "",
      isHoliday: h?.isHoliday ?? false,
    };
  });
}

interface WorkingHoursEditorProps {
  storeId: string;
}

/** 7-row weekly hours editor backed by `GET`/`PUT /stores/me/store/working-hours`. */
export function WorkingHoursEditor({ storeId }: WorkingHoursEditorProps) {
  const hoursQuery = useWorkingHours(true, storeId);
  const updateWorkingHours = useUpdateWorkingHours(storeId);

  const form = useForm<WorkingHoursFormValues>({
    resolver: zodResolver(workingHoursSchema),
    defaultValues: { hours: seedHours(undefined) },
  });

  useEffect(() => {
    if (hoursQuery.data) {
      form.reset({ hours: seedHours(hoursQuery.data) });
    }
  }, [hoursQuery.data, form]);

  const hoursValues = useWatch({ control: form.control, name: "hours" });

  function onSubmit(values: WorkingHoursFormValues) {
    updateWorkingHours.mutate({
      hours: values.hours.map((row) => ({
        dayOfWeek: row.dayOfWeek,
        openTime: row.isHoliday ? null : row.openTime || null,
        closeTime: row.isHoliday ? null : row.closeTime || null,
        breakStart: row.isHoliday ? null : row.breakStart || null,
        breakEnd: row.isHoliday ? null : row.breakEnd || null,
        isHoliday: row.isHoliday,
      })),
    });
  }

  if (hoursQuery.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup>
        {DAY_LABELS.map((label, index) => {
          const isHoliday = hoursValues?.[index]?.isHoliday ?? false;
          return (
            <div
              key={label}
              className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <input
                type="hidden"
                {...form.register(`hours.${index}.dayOfWeek`, { valueAsNumber: true })}
              />
              <span className="w-24 shrink-0 text-sm font-medium text-foreground">{label}</span>
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <Field orientation="horizontal" className="w-fit gap-2">
                  <Switch
                    id={`holiday-${index}`}
                    checked={isHoliday}
                    onCheckedChange={(checked) =>
                      form.setValue(`hours.${index}.isHoliday`, checked, { shouldValidate: true })
                    }
                  />
                  <FieldLabel htmlFor={`holiday-${index}`} className="font-normal">
                    Closed
                  </FieldLabel>
                </Field>
                {!isHoliday && (
                  <>
                    <Field className="w-fit">
                      <FieldLabel htmlFor={`open-${index}`} className="text-xs text-muted-foreground">
                        Open
                      </FieldLabel>
                      <Input
                        id={`open-${index}`}
                        type="time"
                        className="w-32"
                        {...form.register(`hours.${index}.openTime`)}
                      />
                    </Field>
                    <Field className="w-fit">
                      <FieldLabel htmlFor={`close-${index}`} className="text-xs text-muted-foreground">
                        Close
                      </FieldLabel>
                      <Input
                        id={`close-${index}`}
                        type="time"
                        className="w-32"
                        {...form.register(`hours.${index}.closeTime`)}
                      />
                    </Field>
                    <Field className="w-fit">
                      <FieldLabel
                        htmlFor={`breakStart-${index}`}
                        className="text-xs text-muted-foreground"
                      >
                        Break start
                      </FieldLabel>
                      <Input
                        id={`breakStart-${index}`}
                        type="time"
                        className="w-32"
                        {...form.register(`hours.${index}.breakStart`)}
                      />
                    </Field>
                    <Field className="w-fit">
                      <FieldLabel htmlFor={`breakEnd-${index}`} className="text-xs text-muted-foreground">
                        Break end
                      </FieldLabel>
                      <Input
                        id={`breakEnd-${index}`}
                        type="time"
                        className="w-32"
                        {...form.register(`hours.${index}.breakEnd`)}
                      />
                    </Field>
                  </>
                )}
              </div>
            </div>
          );
        })}
        <Button type="submit" disabled={updateWorkingHours.isPending} className="w-fit">
          {updateWorkingHours.isPending && <Loader2 className="size-4 animate-spin" />}
          Save working hours
        </Button>
      </FieldGroup>
    </form>
  );
}
