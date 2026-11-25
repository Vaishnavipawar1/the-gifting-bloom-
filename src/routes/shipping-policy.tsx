import { createFileRoute } from "@tanstack/react-router";
import { Policy } from "@/components/bloom-content";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/shipping-policy")({
  head: () => head("Shipping policy", "Delivery and dispatch information.", "/shipping-policy"),
  component: () => <Policy type="shipping" />,
});
