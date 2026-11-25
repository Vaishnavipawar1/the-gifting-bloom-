import { createFileRoute } from "@tanstack/react-router";
import { Confirmation } from "@/components/bloom-order";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/order-confirmation")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { ref?: string | undefined; demo?: boolean | undefined } => ({
    ref:
      typeof search["ref"] === "string" && /^GB-[A-Z0-9-]{8,36}$/.test(search["ref"])
        ? search["ref"]
        : undefined,
    demo: search["demo"] === true ? true : undefined,
  }),
  head: () => head("Order confirmation", "Your order request reference.", undefined, true),
  component: ConfirmationPage,
});
function ConfirmationPage() {
  const search = Route.useSearch();
  return <Confirmation demo={search["demo"]} reference={search["ref"]} />;
}
