import { permanentRedirect } from "next/navigation";

export default async function LegacyShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const source = await searchParams;
  const target = new URLSearchParams();
  for (const key of ["category", "collection", "search"] as const) {
    const value = source[key];
    if (typeof value === "string" && value.length <= 200) {
      target.set(key, value);
    }
  }
  const query = target.toString();
  permanentRedirect(`/allproducts${query ? `?${query}` : ""}`);
}
