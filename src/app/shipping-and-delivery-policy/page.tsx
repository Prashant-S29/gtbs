import LegalPolicyPage from "@/components/common/LegalPolicyPage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Shipping & Delivery Policy",
  description:
    "Learn how Gujarat Tract Book Store processes, ships, tracks, and delivers orders across India.",
  path: "/shipping-and-delivery-policy",
});

export default function ShippingAndDeliveryPolicyPage() {
  return <LegalPolicyPage policy="shipping" />;
}
