import { defineHandler } from "nitro";
import { ZodError } from "zod";
import { getStore, sendEnquiry } from "../../../../src/lib/bloom-api.server";
import { getAdmin, saveAdmin, uploadBloomMedia } from "../../../../src/lib/bloom-admin.server";
import { publicCloud } from "../../../../src/lib/bloom-cloud.server";

class RequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function requireOwner(request: Request) {
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer ([\w-]+\.[\w-]+\.[\w-]+)$/i)?.[1];
  if (!token) throw new RequestError(401, "Sign in to continue.");

  const db = publicCloud(token);
  const { data, error } = await db.auth.getClaims(token);
  const userId = data?.claims?.sub;
  if (error || !userId) throw new RequestError(401, "Your sign-in has expired.");

  const role = await db
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (role.error || !role.data)
    throw new RequestError(403, "This account does not have owner access.");
  return db;
}

async function jsonBody(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    throw new RequestError(415, "Send the request as JSON.");
  }
  try {
    return (await request.json()) as unknown;
  } catch {
    throw new RequestError(400, "Invalid request body.");
  }
}

export default defineHandler(async (event) => {
  const request = event.req;
  const action = event.context.params?.["action"];
  const headers = { "Cache-Control": "no-store" };
  const respond = (data: unknown, status = 200) => Response.json(data, { status, headers });
  try {
    if (request.method === "GET") {
      if (action === "catalogue") return respond(await getStore());
      if (action === "owner-session" || action === "admin") {
        const db = await requireOwner(request);
        return respond(action === "owner-session" ? true : await getAdmin(db));
      }
    }
    if (request.method === "POST") {
      const origin = request.headers.get("origin");
      if (
        request.headers.get("sec-fetch-site") === "cross-site" ||
        (origin && origin !== new URL(request.url).origin)
      ) {
        throw new RequestError(403, "Cross-site requests are not accepted.");
      }
      if (action === "enquiry") return respond(await sendEnquiry(await jsonBody(request)));
      if (action === "admin" || action === "upload") {
        const db = await requireOwner(request);
        if (action === "admin") return respond(await saveAdmin(db, await jsonBody(request)));
        if (!request.headers.get("content-type")?.startsWith("multipart/form-data")) {
          throw new RequestError(415, "Choose a media file.");
        }
        return respond(await uploadBloomMedia(db, await request.formData()));
      }
    }
    return respond({ error: "Endpoint not found." }, 404);
  } catch (error) {
    if (error instanceof RequestError) return respond({ error: error.message }, error.status);
    if (error instanceof ZodError)
      return respond({ error: "Please check the submitted details." }, 400);
    console.error(error instanceof Error ? error.message : "Bloom API request failed.");
    return respond({ error: "The request could not be completed. Please try again." }, 500);
  }
});
