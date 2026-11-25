import { createFileRoute } from "@tanstack/react-router";
import { Policy } from "@/components/bloom-content";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/terms-conditions")({
  head: () => head("Terms and conditions", "Terms for requesting an order.", "/terms-conditions"),
  component: () => <Policy type="terms" />,
});
