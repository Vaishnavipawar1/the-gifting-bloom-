import { createFileRoute } from "@tanstack/react-router";
import { getStore } from "@/lib/bloom-api";
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin =
          import.meta.env["VITE_SITE_URL"]?.replace(/\/+$/, "") || new URL(request.url).origin;
        const { products } = await getStore();
        const paths = [
          "/",

          "/bouquets",
          "/mini-gifts",
          "/customise",
          "/our-story",
          "/bloom-diaries",
          "/gift-finder",
          "/contact",
          "/privacy-policy",
          "/terms-conditions",

          ...products
            .filter(({ is_demo }) => !is_demo)
            .map(({ slug }) => "/product/" + encodeURIComponent(slug)),
        ];
        const entries = paths
          .map(
            (path) =>
              "<url><loc>" +
              (origin + path).replace(/&/g, "&amp;").replace(/</g, "&lt;") +
              "</loc></url>",
          )
          .join("");
        return new Response(
          '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
            entries +
            "</urlset>",
          { headers: { "content-type": "application/xml; charset=utf-8" } },
        );
      },
    },
  },
});
