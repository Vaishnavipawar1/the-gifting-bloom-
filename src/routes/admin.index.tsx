import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/bloom-admin";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/admin/")({
  head: () => head("Owner dashboard", "Manage The Gifting Bloom store.", "/admin", true),
  component: AdminDashboard,
});
