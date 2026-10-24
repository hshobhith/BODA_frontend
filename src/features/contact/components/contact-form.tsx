"use client";

import { useEffect } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/auth-store";
import { useSendContactMessage } from "../hooks";
import {
  CONTACT_TOPIC_OPTIONS,
  contactMessageSchema,
  type ContactMessageFormValues,
} from "../schemas";

const EMPTY_VALUES: Partial<ContactMessageFormValues> = {
  name: "",
  email: "",
  orderNumber: "",
  message: "",
};

export function ContactForm() {
  const user = useAuthStore((state) => state.user);
  const sendMessage = useSendContactMessage();
  const form = useForm<ContactMessageFormValues>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: EMPTY_VALUES,
  });
  const topic = useWatch({ control: form.control, name: "topic" });

  // Prefill for signed-in users after mount, rather than via defaultValues —
  // the persisted session only exists client-side, so seeding it into the
  // initial render would mismatch the server HTML.
  useEffect(() => {
    if (!user) return;
    if (!form.getValues("name")) form.setValue("name", user.fullName);
    if (!form.getValues("email")) form.setValue("email", user.email);
  }, [user, form]);

  function onSubmit(values: ContactMessageFormValues) {
    sendMessage.mutate({
      name: values.name,
      email: values.email,
      topic: values.topic,
      orderNumber: values.orderNumber || undefined,
      message: values.message,
    });
  }

  if (sendMessage.isSuccess) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-6" />
          </div>
          <CardTitle className="text-xl">Thanks — we got your message</CardTitle>
          <CardDescription>
            We&apos;ll reply to {sendMessage.variables?.email} as soon as we can.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => {
              form.reset({ ...EMPTY_VALUES, name: user?.fullName ?? "", email: user?.email ?? "" });
              sendMessage.reset();
            }}
          >
            Send another message
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { errors } = form.formState;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Send us a message</CardTitle>
        <CardDescription>We read every message and reply by email.</CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="contact-name">Your name</FieldLabel>
                <Input
                  id="contact-name"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  {...form.register("name")}
                />
                <FieldError errors={[errors.name]} />
              </Field>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="contact-email">Email</FieldLabel>
                <Input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  {...form.register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.topic}>
                <FieldLabel htmlFor="contact-topic">Topic</FieldLabel>
                <Select
                  value={topic ?? ""}
                  onValueChange={(value) =>
                    form.setValue("topic", value as ContactMessageFormValues["topic"], {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger
                    id="contact-topic"
                    className="w-full"
                    aria-invalid={!!errors.topic}
                  >
                    <SelectValue placeholder="Choose a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_TOPIC_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.topic]} />
              </Field>
              <Field data-invalid={!!errors.orderNumber}>
                <FieldLabel htmlFor="contact-orderNumber">Order number (optional)</FieldLabel>
                <Input
                  id="contact-orderNumber"
                  placeholder="BODA-20260704-K3F9Q2"
                  aria-invalid={!!errors.orderNumber}
                  {...form.register("orderNumber")}
                />
                <FieldError errors={[errors.orderNumber]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.message}>
              <FieldLabel htmlFor="contact-message">Message</FieldLabel>
              <Textarea
                id="contact-message"
                rows={6}
                aria-invalid={!!errors.message}
                {...form.register("message")}
              />
              <FieldDescription>
                For an order problem, include what you expected and what happened instead.
              </FieldDescription>
              <FieldError errors={[errors.message]} />
            </Field>

            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto sm:self-start"
              disabled={sendMessage.isPending}
            >
              {sendMessage.isPending && <Loader2 className="size-4 animate-spin" />}
              {sendMessage.isPending ? "Sending..." : "Send message"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
