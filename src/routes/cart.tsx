import { createFileRoute } from "@tanstack/react-router";
import { Bag } from "@/components/bloom-order";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/cart")({
  head: () =>
    head("Your shopping bag", "Review your handmade gifts before checkout.", "/cart", true),
  component: Bag,
});
