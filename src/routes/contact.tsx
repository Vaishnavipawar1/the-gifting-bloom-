import { createFileRoute } from "@tanstack/react-router";
import { Contact } from "@/components/bloom-content";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/contact")({
  head: () =>
    head(
      "Contact and FAQs",
      "Ask The Gifting Bloom about orders, delivery, and custom gifts.",
      "/contact",
    ),
  component: Contact,
});
