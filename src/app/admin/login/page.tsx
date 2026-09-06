import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/login/AdminLoginForm";
import { getCurrentAdminSession } from "@/lib/adminAuth";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: `Admin Login | ${siteConfig.name}` },
  description: "Secure administrator login for Gujarat Tract Book Store.",
};

export default async function AdminLoginPage() {
  const session = await getCurrentAdminSession();

  if (session) {
    redirect("/admin/dashboard");
  }

  return <AdminLoginForm />;
}
