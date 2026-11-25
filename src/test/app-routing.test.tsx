import { describe, expect, it } from "vitest";
import { galleryRedirect, resolvePage } from "@/app";
import type { StoreData } from "@/lib/bloom-api";
import { samples } from "@/lib/bloom";

const catalogue: StoreData = {
  products: samples,
  categories: [],
  settings: {},
  reviews: [],
  reels: [],
  cloud: false,
};

describe("App routing", () => {
  it("resolves the homepage and published gallery items", () => {
    expect(resolvePage("/", catalogue).status).toBe(200);
    expect(resolvePage("/product/pocketful-of-sun", catalogue).title).toBe("Pocketful of Sun");
    expect(resolvePage("/admin", catalogue).noIndex).toBe(true);
  });

  it("redirects the legacy gallery URL with its occasion filter", () => {
    expect(galleryRedirect(new URL("https://example.com/shop?occasion=Just%20Because"))).toBe(
      "/?occasion=Just+Because#collection",
    );
  });

  it.each([
    "/cart",
    "/checkout",
    "/wishlist",
    "/order-confirmation",
    "/shipping-policy",
    "/return-refund-policy",
  ])("returns not found for %s", (path) => expect(resolvePage(path, catalogue).status).toBe(404));
});
