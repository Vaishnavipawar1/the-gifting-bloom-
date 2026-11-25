import { supabase } from "@/integrations/supabase/client";
import { bloomRequest } from "./bloom-api";
import type { AdminAction, AdminData } from "./bloom-admin.server";
export type { AdminData } from "./bloom-admin.server";
export { enquiryStates } from "./bloom-admin-shared";

async function ownerRequest<T>(action: string, options: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error("Sign in to continue.");
  const headers = new Headers(options.headers);
  headers.set("Authorization", "Bearer " + data.session.access_token);
  return bloomRequest<T>(action, { ...options, headers });
}

export const ownerSession = () => ownerRequest<boolean>("owner-session");
export const getAdmin = () => ownerRequest<AdminData>("admin");

export function saveAdmin({ data }: { data: AdminAction }) {
  return ownerRequest<boolean>("admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export const uploadBloomMedia = ({ data }: { data: FormData }) =>
  ownerRequest<string>("upload", { method: "POST", body: data });
