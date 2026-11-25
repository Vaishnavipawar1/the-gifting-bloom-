import { createFileRoute } from "@tanstack/react-router";
import { OurStory } from "@/components/bloom-content";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/our-story")({
  head: () =>
    head(
      "Our story",
      "Discover the ideas behind The Gifting Bloom’s handmade gifting.",
      "/our-story",
    ),
  component: OurStory,
});
