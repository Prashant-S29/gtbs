import type { Product } from "@/types/product";

export function localizeProduct(
  product: Product,
  language: "en" | "gu",
): Product {
  if (language !== "gu" || !product.gujarati) return product;

  return {
    ...product,
    title: product.gujarati.title,
    specifications: product.gujarati.specifications,
    variants: product.gujarati.variants,
    description: product.gujarati.description,
    synopsis: product.gujarati.synopsis,
    features: product.gujarati.features,
  };
}
