import { createFileRoute } from "@tanstack/react-router";
import { Customise } from "@/components/bloom-customise";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/customise")({
  head: () =>
    head(
      "Create your own bouquet",
      "Build a personal handmade bouquet with your choice of stems, colours, ribbon, and note.",
      "/customise",
    ),
  component: Customise,
});
