"use client";

import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useGoogleRegister } from "@/features/auth/hooks";
import {
  googleRegisterSchema,
  type GoogleRegisterFormValues,
} from "@/features/auth/schemas";
import type { ApiError } from "@/types/api";
import type { GoogleProfile } from "@/types/auth";
import { AccountTypeField, type AccountType } from "./account-type-field";

/**
 * Step 2 of a first-time Google sign-in: the same details the old register
 * form asked for, minus email (verified by Google, shown read-only) and
 * password (Google accounts don't have one).
 */
export function CompleteRegistrationForm({
  idToken,
  profile,
  defaultRole,
  onStartOver,
}: {
  idToken: string;
  profile: GoogleProfile;
  defaultRole: AccountType;
  /** Back to step 1, e.g. to pick a different Google account. */
  onStartOver: () => void;
}) {
  const googleRegister = useGoogleRegister();
  const form = useForm<GoogleRegisterFormValues>({
    resolver: zodResolver(googleRegisterSchema),
    defaultValues: { fullName: profile.fullName, phone: "", role: defaultRole },
  });
  const role = useWatch({ control: form.control, name: "role" });
  const { errors } = form.formState;

  function onSubmit(values: GoogleRegisterFormValues) {
    googleRegister.mutate(
      {
        idToken,
        fullName: values.fullName,
        phone: values.phone ? values.phone : undefined,
        role: values.role,
      },
      {
        onError: (error) => {
          // Google ID tokens are short-lived; if it expired while the form was
          // open, the only fix is to sign in with Google again.
          if ((error as unknown as ApiError | undefined)?.statusCode === 401) onStartOver();
        },
      }
    );
  }

  const initials = profile.fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Finish creating your account</CardTitle>
        <CardDescription>Just a few details and you&apos;re in.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
          <Avatar>
            {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt="" />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="text-xs text-muted-foreground">Signed in with Google as</span>
            <span className="truncate text-sm font-medium text-foreground">{profile.email}</span>
          </div>
        </div>

        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <AccountTypeField
              value={role}
              onChange={(value) => form.setValue("role", value, { shouldValidate: true })}
              invalid={!!errors.role}
            />

            <Field data-invalid={!!errors.fullName}>
              <FieldLabel htmlFor="fullName">Full name</FieldLabel>
              <Input
                id="fullName"
                autoComplete="name"
                aria-invalid={!!errors.fullName}
                {...form.register("fullName")}
              />
              <FieldError errors={[errors.fullName]} />
            </Field>

            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="phone">Phone (optional)</FieldLabel>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+919876543210"
                aria-invalid={!!errors.phone}
                {...form.register("phone")}
              />
              <FieldDescription>Stores use this to reach you about your orders.</FieldDescription>
              <FieldError errors={[errors.phone]} />
            </Field>

            <Button type="submit" size="lg" className="w-full" disabled={googleRegister.isPending}>
              {googleRegister.isPending && <Loader2 className="size-4 animate-spin" />}
              {googleRegister.isPending ? "Creating account..." : "Create account"}
            </Button>
          </FieldGroup>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Not you?{" "}
          <button
            type="button"
            onClick={onStartOver}
            className="font-medium text-primary hover:underline"
          >
            Use a different Google account
          </button>
        </p>
      </CardContent>
    </>
  );
}
