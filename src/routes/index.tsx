import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/components/bloom-content";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { occasion?: string; category?: string } => ({
    ...(typeof search["occasion"] === "string" ? { occasion: search["occasion"] } : {}),
    ...(typeof search["category"] === "string" ? { category: search["category"] } : {}),
  }),
  head: () =>
    head(
      "Handmade gifts and bouquets",
      "Handmade bouquets, little keepsakes and personalised gifts from The Gifting Bloom.",
      "/",
    ),
  component: HomePage,
});

function HomePage() {
  const { occasion = "", category = "" } = Route.useSearch();
  return <Home occasion={occasion} category={category} />;
}
