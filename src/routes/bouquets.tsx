import { createFileRoute } from "@tanstack/react-router";
import { Gallery } from "@/components/bloom-gallery";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/bouquets")({
  head: () => head("Handmade bouquets", "Explore handmade floral bouquets.", "/bouquets"),
  component: () => <Gallery category="bouquets" />,
});
