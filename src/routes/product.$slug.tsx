import { createFileRoute, notFound } from "@tanstack/react-router";
import { Detail } from "@/components/bloom-gallery";
import { head } from "@/lib/bloom";
import { storeQuery } from "@/lib/bloom-api";
export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params, context }) => {
    const { products } = await context.queryClient.ensureQueryData(storeQuery);
    const product = products.find(({ slug }) => slug === params.slug);
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData: item }) => {
    if (!item)
      return head("Gift not found", "Explore the collection of handmade gifts.", undefined, true);
    const description = item.seo || item.description || item.name;
    const main = head(item.name, description, "/product/" + item.slug, item.is_demo);
    const schema = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: item.name,
      description,
      image: item.image_url || undefined,
    };
    return {
      ...main,
      meta: [
        ...main.meta,
        ...(item.image_url ? [{ property: "og:image", content: item.image_url }] : []),
      ],
      scripts: item.is_demo
        ? []
        : [
            {
              type: "application/ld+json",
              children: JSON.stringify(schema).replace(/</g, "\\u003c"),
            },
          ],
    };
  },
  component: ProductPage,
});
function ProductPage() {
  const product = Route.useLoaderData();
  return <Detail key={product.id} product={product} />;
}
