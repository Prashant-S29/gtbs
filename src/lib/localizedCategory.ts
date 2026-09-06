import type { Category } from "@/types/category";

export function localizeCategory(
  category: Category,
  language: "en" | "gu",
): Category {
  if (language !== "gu" || !category.gujarati) return category;

  return {
    ...category,
    name: category.gujarati.name,
  };
}
