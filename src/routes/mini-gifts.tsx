import { createFileRoute } from "@tanstack/react-router";
import { Gallery } from "@/components/bloom-gallery";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/mini-gifts")({
  head: () => head("Mini gifts", "Explore little handmade gifts and keepsakes.", "/mini-gifts"),
  component: () => <Gallery category="mini-gifts" />,
});
