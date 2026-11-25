import { createFileRoute } from "@tanstack/react-router";
import { Shop } from "@/components/bloom-shop";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): { occasion?: string | undefined } => ({
    occasion: typeof search["occasion"] === "string" ? search["occasion"] : undefined,
  }),
  head: () =>
    head(
      "Shop handmade gifts",
      "Find a handmade bouquet or floral gift by colour, occasion and budget.",
      "/shop",
    ),
  component: ShopPage,
});
function ShopPage() {
  const { occasion } = Route.useSearch();
  return <Shop key={occasion ?? ""} initialOccasion={occasion} />;
}
