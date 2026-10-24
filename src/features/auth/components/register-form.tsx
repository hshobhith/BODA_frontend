"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { useRegister } from "@/features/auth/hooks";
import { registerSchema, type RegisterFormValues } from "@/features/auth/schemas";
import { AccountTypeField } from "./account-type-field";

// `role` carries a zod `.default()`, so the form's *input* shape (before
// parsing) has it optional while the *output* shape (after the resolver
// validates) has it required. RHF's 3-generic `useForm` signature is built
// for exactly this: TFieldValues for defaultValues/watch/setValue, and
// TTransformedValues for what `handleSubmit` hands to `onSubmit`.
type RegisterFormInput = z.input<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registerMutation = useRegister();
  const form = useForm<RegisterFormInput, unknown, RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      // `?role=seller` preselects the seller option (linked from the /sell page).
      role: searchParams.get("role") === "seller" ? "seller" : "customer",
    },
  });

  const role = useWatch({ control: form.control, name: "role" }) ?? "customer";

  function onSubmit(values: RegisterFormValues) {
    registerMutation.mutate(
      {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone ? values.phone : undefined,
        role: values.role,
      },
      {
        onSuccess: () => {
          toast.success(
            "Registration successful! Check your email to verify your account, then log in."
          );
          router.push(ROUTES.login);
        },
      }
    );
  }

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Join BODA to shop or sell locally.</CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <AccountTypeField
              value={role}
              onChange={(value) => form.setValue("role", value, { shouldValidate: true })}
              invalid={!!form.formState.errors.role}
            />

            <Field data-invalid={!!form.formState.errors.fullName}>
              <FieldLabel htmlFor="fullName">Full name</FieldLabel>
              <Input
                id="fullName"
                autoComplete="name"
                placeholder="Jane Doe"
                aria-invalid={!!form.formState.errors.fullName}
                {...form.register("fullName")}
              />
              <FieldError errors={[form.formState.errors.fullName]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!form.formState.errors.email}
                {...form.register("email")}
              />
              <FieldError errors={[form.formState.errors.email]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.phone}>
              <FieldLabel htmlFor="phone">
                Phone <span className="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 555 123 4567"
                aria-invalid={!!form.formState.errors.phone}
                {...form.register("phone")}
              />
              <FieldError errors={[form.formState.errors.phone]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!form.formState.errors.password}
                {...form.register("password")}
              />
              <FieldError errors={[form.formState.errors.password]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!form.formState.errors.confirmPassword}
                {...form.register("confirmPassword")}
              />
              <FieldError errors={[form.formState.errors.confirmPassword]} />
            </Field>

            <Button type="submit" size="lg" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {registerMutation.isPending ? "Creating account..." : "Create account"}
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={ROUTES.login} className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </>
  );
}
