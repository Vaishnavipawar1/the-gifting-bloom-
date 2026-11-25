import { createFileRoute } from "@tanstack/react-router";
import { GiftFinder } from "@/components/bloom-shop";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/gift-finder")({
  head: () =>
    head("Gift finder", "Find a handmade gift by occasion, budget, and colour.", "/gift-finder"),
  component: GiftFinder,
});
