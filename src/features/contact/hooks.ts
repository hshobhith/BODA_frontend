"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { SUPPORT_EMAIL } from "@/constants/config";
import type { ApiError } from "@/types/api";
import type { ContactMessagePayload } from "@/types/contact";
import { contactApi } from "./api";

export function useSendContactMessage() {
  return useMutation({
    mutationFn: (payload: ContactMessagePayload) => contactApi.send(payload),
    onSuccess: () => {
      toast.success("Message sent. We'll reply by email.");
    },
    onError: (error) => {
      const apiError = error as unknown as ApiError | undefined;
      if (apiError?.statusCode === 429) {
        toast.error("You've sent several messages in a row — please wait a minute and try again.");
        return;
      }
      toast.error(
        apiError?.message || `Could not send your message. Please email us at ${SUPPORT_EMAIL}.`
      );
    },
  });
}
