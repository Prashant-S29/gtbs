import LegalPolicyPage from "@/components/common/LegalPolicyPage";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Terms & Conditions",
  description:
    "Read the terms that govern use of the Gujarat Tract Book Store website and WhatsApp-assisted purchases.",
  path: "/terms-and-conditions",
});

export default function TermsAndConditionsPage() {
  return <LegalPolicyPage policy="terms" />;
}
