import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { publicCloud } from "./bloom-cloud.server";
import {
  customSchema,
  defaultPricing,
  describeCustom,
  jsonSetting,
  pricingSchema,
  productOptions,
  quote,
  samples,
  type Product,
} from "./bloom";

export const getStore = createServerFn({ method: "GET" }).handler(async () => {
  const fallback = {
    products: samples,
    categories: [] as { id: string; slug: string; name: string }[],
    settings: {} as Record<string, string>,
    reviews: [] as {
      id: string;
      customer_name: string;
      product_name: string;
      review: string;
      rating: number | null;
    }[],
    reels: [] as {
      id: string;
      caption: string;
      thumbnail_url: string;
      post_url: string;
      product_id: string | null;
    }[],
    pricing: defaultPricing,
    cloud: false,
  };
  try {
    const db = publicCloud();
    const [products, categories, settings, reviews, reels] = await Promise.all([
      db.from("products").select("*").eq("active", true).order("sort_order").order("created_at"),
      db.from("product_categories").select("id,slug,name").eq("active", true).order("sort_order"),
      db.from("website_settings").select("key,value"),
      db
        .from("testimonials")
        .select("id,customer_name,product_name,review,rating")
        .eq("approved", true)
        .order("created_at", { ascending: false }),
      db
        .from("media_reels")
        .select("id,caption,thumbnail_url,post_url,product_id")
        .eq("active", true)
        .order("sort_order"),
    ]);
    const config = Object.fromEntries((settings.data ?? []).map(({ key, value }) => [key, value]));
    const catalog = (products.data ?? []).map((product): Product => {
      const category = categories.data?.find(({ id }) => id === product.category_id);
      return {
        ...product,
        category: category?.slug ?? "",
        categoryName: category?.name ?? "Handmade gifts",
        ...jsonSetting(
          config["product:" + product.id],
          productOptions.parse,
          productOptions.parse({}),
        ),
      };
    });
    return {
      products: catalog.length || config["hide_demo"] === "true" ? catalog : samples,
      categories: categories.data ?? [],
      settings: config,
      reviews: reviews.data ?? [],
      reels: reels.data ?? [],
      pricing: jsonSetting(config["pricing"], pricingSchema.parse, defaultPricing),
      cloud: !products.error && !settings.error,
    };
  } catch {
    return fallback;
  }
});
export type StoreData = Awaited<ReturnType<typeof getStore>>;
export const storeQuery = {
  queryKey: ["bloom-store"],
  queryFn: () => getStore(),
  staleTime: 30_000,
} as const;

const customer = {
  customer_name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d ()-]{7,26}$/)
    .refine((value) => value.replace(/\D/g, "").length >= 7),
};
export const orderSchema = z.object({
  ...customer,
  address: z.string().trim().min(5).max(500),
  postal_code: z.string().regex(/^\d{6}$/),
  gift_message: z.string().max(500),
  delivery_instructions: z.string().max(500),
  request_id: z.uuid(),
  lines: z
    .array(
      z.discriminatedUnion("kind", [
        z.object({
          kind: z.literal("product"),
          id: z.uuid(),
          quantity: z.number().int().min(1).max(50),
          colour: z.string().max(80),
          variant: z.string().max(80),
          note: z.string().max(500),
          unit: z.number().int().min(0),
        }),
        z.object({
          kind: z.literal("custom"),
          custom: customSchema,
          quantity: z.number().int().min(1).max(50),
          unit: z.number().int().min(0),
        }),
      ]),
    )
    .min(1)
    .max(50),
});
export const requestOrder = createServerFn({ method: "POST" })
  .validator(orderSchema)
  .handler(async ({ data }) => {
    const { request_id, lines, ...details } = data;
    const db = publicCloud();
    const ids = [...new Set(lines.flatMap((line) => (line.kind === "product" ? [line.id] : [])))];
    const [catalog, settings] = await Promise.all([
      ids.length
        ? db
            .from("products")
            .select("id,name,price_cents,stock_count,colors,is_demo")
            .in("id", ids)
            .eq("active", true)
        : Promise.resolve({ data: [], error: null }),
      db
        .from("website_settings")
        .select("key,value")
        .in("key", ["pricing", ...ids.map((id) => "product:" + id)]),
    ]);
    if (catalog.error || settings.error)
      throw new Error("We could not verify the current catalogue. Please try again.");
    const config = Object.fromEntries(settings.data.map(({ key, value }) => [key, value]));
    const prices = jsonSetting(config["pricing"], pricingSchema.parse, defaultPricing);
    const requested = new Map<string, number>();
    const items = lines.map((line) => {
      if (line.kind === "custom") {
        const unit = quote(line.custom, prices);
        if (unit !== line.unit)
          throw new Error(
            "Bouquet pricing changed. Please rebuild the bouquet to get an updated estimate.",
          );
        return {
          name: "Custom bouquet",
          description: describeCustom(line.custom),
          unit,
          quantity: line.quantity,
        };
      }
      const product = catalog.data.find(({ id }) => id === line.id);
      const quantity = (requested.get(line.id) ?? 0) + line.quantity;
      requested.set(line.id, quantity);
      if (!product || product.is_demo || quantity > product.stock_count)
        throw new Error("An item is unavailable in that quantity.");
      if (product.price_cents !== line.unit)
        throw new Error("A price changed. Re-add the item to see the current price.");
      const options = jsonSetting(
        config["product:" + line.id],
        productOptions.parse,
        productOptions.parse({}),
      );
      if (
        (product.colors.length && !product.colors.includes(line.colour)) ||
        (options.variants.length && !options.variants.includes(line.variant))
      )
        throw new Error("A selected option is unavailable. Re-add the item from its product page.");
      return {
        id: product.id,
        name: product.name,
        description: [line.colour, line.variant, line.note].filter(Boolean).join(" · "),
        unit: product.price_cents,
        quantity: line.quantity,
      };
    });
    const subtotal = items.reduce((total, item) => total + item.unit * item.quantity, 0);
    if (subtotal > 2147483647) throw new Error("Please split this request into smaller orders.");
    const reference = "GB-" + request_id.toUpperCase();
    const { error } = await db
      .from("orders")
      .insert({
        ...details,
        order_reference: reference,
        subtotal_cents: subtotal,
        total_cents: subtotal,
        items,
      });
    if (error && error.code !== "23505")
      throw new Error("We could not save your order request. Please try again.");
    return { reference };
  });

export const enquirySchema = z.object({
  ...customer,
  subject: z.string().trim().min(2).max(120),
  message: z.string().trim().min(5).max(2000),
});
export const sendEnquiry = createServerFn({ method: "POST" })
  .validator(enquirySchema)
  .handler(async ({ data }) => {
    const { error } = await publicCloud().from("contact_enquiries").insert(data);
    if (error) throw new Error("We could not send your enquiry. Please try again.");
    return true;
  });
export const requestCustom = createServerFn({ method: "POST" })
  .validator(z.object({ ...customer, custom: customSchema }))
  .handler(async ({ data: { custom, ...details } }) => {
    const { error } = await publicCloud()
      .from("custom_orders")
      .insert({
        ...details,
        occasion: custom.occasion,
        requirements: custom,
        message: custom.message,
      });
    if (error) throw new Error("We could not save your bouquet enquiry. Please try again.");
    return true;
  });
