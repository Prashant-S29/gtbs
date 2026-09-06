import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import StorefrontText from "@/components/common/StorefrontText";

interface ProductGridProps {
  products: Product[];
  className?: string;
}

export default function ProductGrid({
  products,
  className = "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
}: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 description text-sm">
          <StorefrontText translationKey="catalog.noProductsCriteria" />
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
