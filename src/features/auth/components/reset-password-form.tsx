"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, TriangleAlert } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { useResetPassword } from "@/features/auth/hooks";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/features/auth/schemas";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const resetPassword = useResetPassword();
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  if (!token) {
    return (
      <>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert className="size-6" />
          </div>
          <CardTitle className="text-2xl">Invalid reset link</CardTitle>
          <CardDescription>
            This password reset link is missing or invalid. Request a new one to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href={ROUTES.forgotPassword}>Request a new link</Link>
          </Button>
        </CardContent>
      </>
    );
  }

  function onSubmit(values: ResetPasswordFormValues) {
    // `token` is narrowed to `string` above, but TS doesn't carry that
    // narrowing into this closure (it could theoretically run at a later,
    // unnarrowed point) — safe to assert since we already returned early.
    resetPassword.mutate({ token: token as string, newPassword: values.newPassword });
  }

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Set a new password</CardTitle>
        <CardDescription>Choose a new password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.newPassword}>
              <FieldLabel htmlFor="newPassword">New password</FieldLabel>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!form.formState.errors.newPassword}
                {...form.register("newPassword")}
              />
              <FieldError errors={[form.formState.errors.newPassword]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!form.formState.errors.confirmPassword}
                {...form.register("confirmPassword")}
              />
              <FieldError errors={[form.formState.errors.confirmPassword]} />
            </Field>
            <Button type="submit" size="lg" className="w-full" disabled={resetPassword.isPending}>
              {resetPassword.isPending && <Loader2 className="size-4 animate-spin" />}
              {resetPassword.isPending ? "Resetting..." : "Reset password"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </>
  );
}
