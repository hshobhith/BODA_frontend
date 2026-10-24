/** Matches backend's `ContactTopic` enum (modules/contact/dto/create-contact-message.dto.ts). */
export type ContactTopic = "order" | "returns" | "account" | "selling" | "other";

/** Body for `POST /contact`. The endpoint returns no payload. */
export interface ContactMessagePayload {
  name: string;
  email: string;
  topic: ContactTopic;
  orderNumber?: string;
  message: string;
}
