"use client";

import { useEffect } from "react";
import { MailWarning } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCurrentUser, useResendVerification, useUpdateProfile } from "@/features/auth/hooks";
import { updateProfileSchema, type UpdateProfileFormValues } from "@/features/auth/schemas";
import { useAuthStore } from "@/store/auth-store";

export function ProfileForm() {
  const storeUser = useAuthStore((state) => state.user);
  // GET /users/me kept as the source of truth once it resolves; the store's
  // (possibly stale) user from login/register fills the gap before it does.
  const { data: currentUser } = useCurrentUser();
  const user = currentUser ?? storeUser;

  const updateProfile = useUpdateProfile();
  const resendVerification = useResendVerification();

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
      avatarUrl: user?.avatarUrl ?? "",
    },
  });

  useEffect(() => {
    if (currentUser) {
      form.reset({
        fullName: currentUser.fullName,
        phone: currentUser.phone ?? "",
        avatarUrl: currentUser.avatarUrl ?? "",
      });
    }
  }, [currentUser, form]);

  function onSubmit(values: UpdateProfileFormValues) {
    updateProfile.mutate({
      fullName: values.fullName,
      phone: values.phone ? values.phone : undefined,
      avatarUrl: values.avatarUrl ? values.avatarUrl : undefined,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your name, phone, and avatar.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {user && !user.emailVerifiedAt && (
          <Alert variant="destructive">
            <MailWarning />
            <AlertTitle>Verify your email</AlertTitle>
            <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>Please verify {user.email} to unlock all features.</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => resendVerification.mutate()}
                disabled={resendVerification.isPending}
                className="w-fit"
              >
                {resendVerification.isPending ? "Sending..." : "Resend email"}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.fullName}>
              <FieldLabel htmlFor="fullName">Full name</FieldLabel>
              <Input
                id="fullName"
                autoComplete="name"
                aria-invalid={!!form.formState.errors.fullName}
                {...form.register("fullName")}
              />
              <FieldError errors={[form.formState.errors.fullName]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.phone}>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                aria-invalid={!!form.formState.errors.phone}
                {...form.register("phone")}
              />
              <FieldError errors={[form.formState.errors.phone]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.avatarUrl}>
              <FieldLabel htmlFor="avatarUrl">Avatar URL</FieldLabel>
              <Input
                id="avatarUrl"
                type="url"
                placeholder="https://..."
                aria-invalid={!!form.formState.errors.avatarUrl}
                {...form.register("avatarUrl")}
              />
              <FieldError errors={[form.formState.errors.avatarUrl]} />
            </Field>
            <Button type="submit" disabled={updateProfile.isPending} className="w-fit">
              {updateProfile.isPending ? "Saving..." : "Save changes"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
