import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): { occasion?: string } => ({
    ...(typeof search["occasion"] === "string" ? { occasion: search["occasion"] } : {}),
  }),
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/", hash: "collection", search, statusCode: 301 });
  },
});
