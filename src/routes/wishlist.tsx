import { createFileRoute } from "@tanstack/react-router";
import { Wishlist } from "@/components/bloom-shop";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/wishlist")({
  head: () => head("Your wishlist", "See your saved handmade gifts.", "/wishlist", true),
  component: Wishlist,
});
