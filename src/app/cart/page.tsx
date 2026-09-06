import { createPageMetadata } from "@/lib/seo";
import CartPageClient from "@/components/cart/CartPageClient";

export const metadata = createPageMetadata({
  title: "Shopping Cart",
  description: "Review the books and products in your GTBS Book Store cart.",
  path: "/cart",
  noIndex: true,
});

export default function CartPage() {
  return <CartPageClient />;
}
