export const PRODUCT_BADGES = [
  "Best Sellers",
  "New Releases",
  "Trending Products",
  "Accessories",
] as const;

export type ProductBadge = (typeof PRODUCT_BADGES)[number];

export interface ProductSpecification {
  name: string;
  value: string;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface ProductDetailImage {
  id: string;
  url: string;
  key?: string;
  title: string;
}

interface ProductLocalizedContent {
  title: string;
  specifications?: ProductSpecification[];
  variants?: ProductVariant[];
  description?: string;
  synopsis?: string;
  features?: string[];
}

interface ProductReview {
  id: string;
  user: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase?: boolean;
}

export interface Product {
  id: string;
  title: string;
  author?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  imageKey?: string;
  detailImages?: ProductDetailImage[];
  /** Legacy detail-image URLs retained for persisted catalog compatibility. */
  images?: string[];
  category: string;
  rating?: number;
  reviewsCount?: number;
  inStock?: boolean;
  stockCount?: number;
  badge?: string;
  specifications?: ProductSpecification[];
  variants?: ProductVariant[];
  /** Legacy book-specific fields retained for persisted catalog compatibility. */
  format?: ("Hardcover" | "Paperback" | "E-Book" | "Audiobook")[];
  pages?: number;
  publisher?: string;
  publishedDate?: string;
  isbn?: string;
  language?: string;
  dimensions?: string;
  description?: string;
  synopsis?: string;
  authorBio?: string;
  features?: string[];
  gujarati?: ProductLocalizedContent;
  reviews?: ProductReview[];
}
