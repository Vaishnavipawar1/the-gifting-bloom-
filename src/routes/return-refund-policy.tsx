import { createFileRoute } from "@tanstack/react-router";
import { Policy } from "@/components/bloom-content";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/return-refund-policy")({
  head: () =>
    head("Returns and refunds", "Information about returns and refunds.", "/return-refund-policy"),
  component: () => <Policy type="returns" />,
});
