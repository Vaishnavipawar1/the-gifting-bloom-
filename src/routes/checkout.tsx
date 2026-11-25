import { createFileRoute } from "@tanstack/react-router";
import { Checkout } from "@/components/bloom-order";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/checkout")({
  head: () => head("Checkout", "Request an order from The Gifting Bloom.", "/checkout", true),
  component: Checkout,
});
