import { createFileRoute } from "@tanstack/react-router";
import { Shop } from "@/components/bloom-shop";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/bouquets")({
  head: () => head("Handmade bouquets", "Explore handmade floral bouquets.", "/bouquets"),
  component: () => <Shop category="bouquets" />,
});
