import { createFileRoute } from "@tanstack/react-router";
import { AdminLogin } from "@/components/bloom-admin";
import { head } from "@/lib/bloom";
export const Route = createFileRoute("/admin/login")({
  head: () => head("Owner sign-in", "Sign in to manage The Gifting Bloom.", "/admin/login", true),
  component: AdminLogin,
});
