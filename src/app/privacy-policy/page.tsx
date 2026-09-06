import LegalPolicyPage from "@/components/common/LegalPolicyPage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "Learn how Gujarat Tract Book Store collects, uses, stores, and protects your personal information.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return <LegalPolicyPage policy="privacy" />;
}
