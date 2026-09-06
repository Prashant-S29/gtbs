import AllProductsPageClient from "@/components/product/AllProductsPageClient";
import { getCategories, getProducts } from "@/lib/contentRepository";

export const revalidate = 300;

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const category =
    typeof params.category === "string" ? params.category : "all";
  const collection =
    typeof params.collection === "string" ? params.collection : "all";
  const search = typeof params.search === "string" ? params.search : "";
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <AllProductsPageClient
      key={`${category}:${collection}:${search}`}
      initialCategory={category}
      initialCollection={collection}
      initialSearch={search}
      products={products}
      categories={categories}
    />
  );
}
