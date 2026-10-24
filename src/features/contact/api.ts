import { apiClient } from "@/services/api-client";
import type { ContactMessagePayload } from "@/types/contact";

export const contactApi = {
  /** Public — works signed in or out. Forwards the message to the support inbox. */
  send: (payload: ContactMessagePayload) =>
    apiClient.post<void>("/contact", payload).then((r) => r.data),
};
