import { createFileRoute } from "@tanstack/react-router";
import { Shop } from "@/components/bloom-shop";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/mini-gifts")({
  head: () => head("Mini gifts", "Explore little handmade gifts and keepsakes.", "/mini-gifts"),
  component: () => <Shop category="mini-gifts" />,
});
