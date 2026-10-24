import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  CreditCard,
  Mail,
  PackageSearch,
  RotateCcw,
  Store,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants/config";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Help center",
  description: `Answers to common questions about ordering, payment, returns, and selling on ${APP_NAME}.`,
};

interface HelpTopic {
  id: string;
  icon: LucideIcon;
  title: string;
  summary: string;
  questions: { q: string; a: ReactNode }[];
}

const linkClass = "font-medium text-primary";

const TOPICS: HelpTopic[] = [
  {
    id: "orders",
    icon: PackageSearch,
    title: "Orders & delivery",
    summary: "Placing, tracking, and receiving orders",
    questions: [
      {
        q: "How do I know if a store delivers to me?",
        a: (
          <p>
            Each store chooses whether it offers pickup, delivery, or both, and sets its own
            delivery radius, fee, and free-delivery threshold. These are shown on the store page,
            and checkout only offers the options that store supports.
          </p>
        ),
      },
      {
        q: "Can I order from more than one store at once?",
        a: (
          <p>
            Yes. Your cart can hold items from several stores, grouped by store. You check out one
            store at a time: each store&apos;s items become a separate order with its own delivery
            fee and tracking, and the other stores&apos; items stay in your cart.
          </p>
        ),
      },
      {
        q: "How do I track my order?",
        a: (
          <p>
            Go to{" "}
            <Link href={ROUTES.orders} className={linkClass}>
              your orders
            </Link>{" "}
            and open the order. Its timeline shows every step, from New through Processing and
            Packed to Out for delivery and Delivered. Pickup orders go straight from Packed to
            Delivered once you&apos;ve collected them.
          </p>
        ),
      },
      {
        q: "How much does delivery cost?",
        a: (
          <p>
            Each store sets a flat delivery fee, and can choose to waive it above a set order amount.
            You&apos;ll see the exact fee at checkout before you place the order. Pickup is always
            free.
          </p>
        ),
      },
    ],
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "Payments",
    summary: "Cash on Delivery and invoices",
    questions: [
      {
        q: "How do I pay?",
        a: (
          <p>
            {APP_NAME} currently uses Cash on Delivery: you pay the store when your order is
            delivered or when you pick it up. Nothing is charged when you place the order.
          </p>
        ),
      },
      {
        q: "Can I pay by card or UPI?",
        a: <p>Not yet. Every order is paid in cash at delivery or pickup for now.</p>,
      },
      {
        q: "Where can I get an invoice?",
        a: (
          <p>
            Open the order from{" "}
            <Link href={ROUTES.orders} className={linkClass}>
              your orders
            </Link>{" "}
            and choose <strong>Download invoice</strong> to get a PDF.
          </p>
        ),
      },
    ],
  },
  {
    id: "returns",
    icon: RotateCcw,
    title: "Cancellations & returns",
    summary: "Changing your mind or sending something back",
    questions: [
      {
        q: "Can I cancel an order?",
        a: (
          <p>
            Yes, while it&apos;s still New or Processing. Open the order and choose{" "}
            <strong>Cancel order</strong>. Once the store has packed it, contact the store
            directly; their phone and email are on the store page.
          </p>
        ),
      },
      {
        q: "How do returns work?",
        a: (
          <p>
            Return eligibility is set by each store and shown on the product page. Our{" "}
            <Link href={ROUTES.returns} className={linkClass}>
              returns & refunds guide
            </Link>{" "}
            walks through requesting a return step by step.
          </p>
        ),
      },
      {
        q: "How will I get my refund?",
        a: (
          <p>
            Because every order is paid in cash to the store, the store pays any refund directly.
            The order will show as Refunded once that&apos;s done.
          </p>
        ),
      },
    ],
  },
  {
    id: "account",
    icon: UserRound,
    title: "Your account",
    summary: "Sign-in, addresses, and your data",
    questions: [
      {
        q: "How do I sign in or create an account?",
        a: (
          <p>
            Choose the Google button on the{" "}
            <Link href={ROUTES.login} className={linkClass}>
              log-in page
            </Link>
            . The first time, you&apos;ll pick a customer or seller account and confirm your name
            and phone number. After that, the same button signs you straight in.
          </p>
        ),
      },
      {
        q: "Can I sign in without a Google account?",
        a: (
          <p>
            Not at the moment. Every {APP_NAME}{" "}
            account signs in with Google, so there&apos;s no separate password to remember or
            reset. Your Google account&apos;s email address is the email on your {APP_NAME} account.
          </p>
        ),
      },
      {
        q: "How do I change my delivery addresses?",
        a: (
          <p>
            Add, edit, or remove addresses under{" "}
            <Link href={ROUTES.accountAddresses} className={linkClass}>
              Account → Addresses
            </Link>
            . You can also add a new one during checkout.
          </p>
        ),
      },
      {
        q: "How do I delete my account?",
        a: (
          <p>
            <Link href={ROUTES.contact} className={linkClass}>
              Contact us
            </Link>{" "}
            from the email address on your account and we&apos;ll take care of it.
          </p>
        ),
      },
    ],
  },
  {
    id: "selling",
    icon: Store,
    title: "Selling on BODA",
    summary: "Opening and running a store",
    questions: [
      {
        q: "How do I start selling?",
        a: (
          <p>
            See{" "}
            <Link href={ROUTES.sell} className={linkClass}>
              Sell on {APP_NAME}
            </Link>{" "}
            for how to get started. Already have a customer account? You can switch it to a
            seller account from{" "}
            <Link href={ROUTES.account} className={linkClass}>
              Account settings
            </Link>
            .
          </p>
        ),
      },
      {
        q: "Why isn't my store showing up for customers?",
        a: (
          <p>
            New stores need admin approval before they appear in search. After approval, set your
            store to <strong>Open for business</strong> on the Store settings page. Approval
            doesn&apos;t open it automatically.
          </p>
        ),
      },
      {
        q: "Where can I learn the seller tools?",
        a: (
          <p>
            The{" "}
            <Link href={ROUTES.sellerGuide} className={linkClass}>
              seller guide
            </Link>{" "}
            covers store setup, products and stock, delivery settings, and fulfilling orders.
          </p>
        ),
      },
    ],
  },
];

export default function HelpCenterPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Help center</h1>
        <p className="text-muted-foreground">
          Answers to the questions we hear most. Can&apos;t find yours?{" "}
          <Link href={ROUTES.contact} className="font-medium text-primary hover:underline">
            Contact us
          </Link>
          .
        </p>
      </div>

      <nav aria-label="Help topics" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map(({ id, icon: Icon, title, summary }) => (
          <a
            key={id}
            href={`#${id}`}
            className="flex items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4.5" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">{title}</span>
              <span className="text-xs text-muted-foreground">{summary}</span>
            </span>
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-8">
        {TOPICS.map(({ id, title, questions }) => (
          <section key={id} id={id} className="scroll-mt-24">
            <h2 className="mb-2 text-lg font-semibold text-foreground">{title}</h2>
            <Accordion type="single" collapsible className="rounded-xl border px-4">
              {questions.map(({ q, a }) => (
                <AccordionItem key={q} value={q}>
                  <AccordionTrigger className="py-4">{q}</AccordionTrigger>
                  <AccordionContent className="pb-4 text-muted-foreground">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Still need help?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Send us a message and we&apos;ll get back to you by email.
          </p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href={ROUTES.contact}>
            <Mail className="size-4" />
            Contact us
          </Link>
        </Button>
      </div>
    </div>
  );
}
