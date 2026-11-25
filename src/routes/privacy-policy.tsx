import { createFileRoute } from "@tanstack/react-router";
import { Policy } from "@/components/bloom-content";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/privacy-policy")({
  head: () =>
    head("Privacy policy", "How The Gifting Bloom handles your details.", "/privacy-policy"),
  component: () => <Policy type="privacy" />,
});
