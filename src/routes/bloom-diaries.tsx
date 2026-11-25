import { createFileRoute } from "@tanstack/react-router";
import { Diaries } from "@/components/bloom-content";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/bloom-diaries")({
  head: () =>
    head(
      "Bloom Diaries",
      "See behind-the-scenes reels and handmade gifting moments from The Gifting Bloom.",
      "/bloom-diaries",
    ),
  component: Diaries,
});
