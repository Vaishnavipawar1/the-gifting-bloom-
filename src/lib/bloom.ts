import type { Tables } from "@/integrations/supabase/types";
import { z } from "zod";

export const instagram = "https://www.instagram.com/the_gifting_bloom11/";
export const money = (cents: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: cents % 100 ? 2 : 0,
  }).format(cents / 100);
export const colours = {
  Rose: "#b84d69",
  Blush: "#e7a0b4",
  Ivory: "#f5e5ca",
  Lavender: "#ae99cc",
  Sage: "#94a687",
  Gold: "#e1a32e",
  Plum: "#684052",
};
export const occasions = [
  "Valentine's Day",
  "Birthdays",
  "Anniversaries",
  "Friendship Day",
  "Graduation",
  "Congratulations",
  "Festive Gifting",
  "Just Because",
] as const;
export const categoryNames = { bouquets: "Bouquets", "mini-gifts": "Mini gifts" };
export const productOptions = z.object({
  images: z.array(z.url()).max(8).default([]),
  video: z.union([z.url(), z.literal("")]).default(""),
  occasions: z.array(z.string().max(80)).max(12).default([]),
  variants: z.array(z.string().max(80)).max(12).default([]),
  dispatch: z.string().max(160).default(""),
  seo: z.string().max(160).default(""),
});
export type ProductOptions = z.infer<typeof productOptions>;
export type Product = Omit<
  Tables<"products">,
  "created_at" | "updated_at" | "category_id" | "active" | "sort_order"
> &
  ProductOptions & { category: string; categoryName: string };
const demoProduct = (
  slug: string,
  name: string,
  price_cents: number,
  category: keyof typeof categoryNames,
  colors: string[],
  description: string,
  targets: string[],
): Product => ({
  id: slug,
  slug,
  name,
  price_cents,
  category,
  categoryName: categoryNames[category],
  colors,
  description,
  stock_count: 12,
  image_url: "/blooms/" + slug + ".jpg",
  image_alt: name + " concept image",
  is_demo: true,
  ...productOptions.parse({ occasions: targets }),
});
export const samples = [
  demoProduct(
    "blush-keepsake",
    "The Blush Keepsake",
    89900,
    "bouquets",
    ["Blush", "Ivory", "Rose"],
    "Soft chenille roses gathered in cream paper and finished with a rose-pink ribbon.",
    [occasions[0], occasions[2], occasions[7]],
  ),
  demoProduct(
    "pocketful-of-sun",
    "Pocketful of Sun",
    74900,
    "bouquets",
    ["Gold", "Sage"],
    "A bundle of sunny chenille stems in warm kraft wrap for days that deserve a little brightness.",
    [occasions[1], occasions[4], occasions[5]],
  ),
  demoProduct(
    "lavender-letter",
    "The Lavender Letter",
    54900,
    "bouquets",
    ["Lavender", "Ivory"],
    "A petite posy of lavender and cream daisies, finished with a matching ribbon.",
    [occasions[3], occasions[6], occasions[7]],
  ),
  demoProduct(
    "little-bloom-charm",
    "Little Bloom Charm",
    24900,
    "mini-gifts",
    ["Blush", "Lavender"],
    "A small fuzzy daisy on a gold-tone keyring to carry a little bloom wherever you go.",
    [occasions[1], occasions[3], occasions[7]],
  ),
];
export const defaultPricing = {
  rose: 18000,
  daisy: 12000,
  sunflower: 16000,
  classic: 10000,
  grand: 22000,
  packaging: 12000,
};
export const pricingSchema = z.object({
  rose: z.number().int().min(1).max(1000000),
  daisy: z.number().int().min(1).max(1000000),
  sunflower: z.number().int().min(1).max(1000000),
  classic: z.number().int().min(0).max(1000000),
  grand: z.number().int().min(0).max(1000000),
  packaging: z.number().int().min(0).max(1000000),
});
export const customSchema = z.object({
  flower: z.enum(["rose", "daisy", "sunflower"]),
  count: z.number().int().min(1).max(24),
  colours: z
    .array(z.enum(["Rose", "Blush", "Ivory", "Lavender", "Sage", "Gold", "Plum"]))
    .min(1)
    .max(4),
  size: z.enum(["petite", "classic", "grand"]),
  wrap: z.enum(["Ivory", "Blush", "Lavender", "Sage"]),
  ribbon: z.enum(["Ivory", "Rose", "Gold", "Plum"]),
  occasion: z.string().max(80),
  message: z.string().max(500),
  packaging: z.boolean(),
});
export type Custom = z.infer<typeof customSchema>;
export const quote = (item: Custom, price = defaultPricing) =>
  price[item.flower] * item.count +
  (item.size === "petite" ? 0 : price[item.size]) +
  (item.packaging ? price.packaging : 0);
export function jsonSetting<T>(
  value: string | undefined,
  parse: (input: unknown) => T,
  fallback: T,
): T {
  try {
    return value ? parse(JSON.parse(value)) : fallback;
  } catch {
    return fallback;
  }
}
export const whatsapp = (number: string | undefined, message: string) => {
  const digits = number?.replace(/\D/g, "");
  return digits && /^\d{8,15}$/.test(digits)
    ? "https://wa.me/" + digits + "?text=" + encodeURIComponent(message)
    : undefined;
};
export const head = (title: string, description: string, path?: string, noIndex = false) => {
  const full = title + " | The Gifting Bloom";
  const origin = import.meta.env["VITE_SITE_URL"]?.replace(/\/+$/, "");
  return {
    meta: [
      { title: full },
      { name: "description", content: description },
      { property: "og:title", content: full },
      { property: "og:description", content: description },
      ...(noIndex ? [{ name: "robots", content: "noindex, follow" }] : []),
    ],
    links: origin && path ? [{ rel: "canonical", href: origin + path }] : [],
  };
};
export function describeCustom(item: Custom) {
  return [
    item.count + " " + item.flower + " stems",
    item.colours.join(", "),
    item.size,
    item.wrap + " wrap",
    item.ribbon + " ribbon",
    item.occasion,
    item.packaging && "gift box",
    item.message && "Note: " + item.message,
  ]
    .filter(Boolean)
    .join(" · ");
}
