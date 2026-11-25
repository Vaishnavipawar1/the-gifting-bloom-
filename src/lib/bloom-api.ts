import type { StoreData } from "./bloom-api.server";
export type { StoreData } from "./bloom-api.server";

export async function bloomRequest<T>(action: string, options?: RequestInit): Promise<T> {
  const response = await fetch("/api/bloom/" + action, options);
  if (!response.ok) {
    const body: { error?: string } = await response.json().catch(() => ({}));
    throw new Error(body.error || "The request could not be completed.");
  }
  return response.json() as Promise<T>;
}

export function getStore(): Promise<StoreData> {
  return bloomRequest("catalogue");
}

export function sendEnquiry({
  data,
}: {
  data: {
    customer_name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  };
}) {
  return bloomRequest<boolean>("enquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
