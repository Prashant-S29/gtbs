import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminContentShell from "@/components/admin/AdminContentShell";
import AdminProductForm from "@/components/admin/product/AdminProductForm";
import { getCurrentAdminSession } from "@/lib/adminAuth";
import { getCategories } from "@/lib/contentRepository";

export const metadata: Metadata = { title: "Add Product" };

export default async function AddProductPage() {
  if (!(await getCurrentAdminSession())) redirect("/admin/login");
  return (
    <AdminContentShell
      title="Add product"
      description="Create a new storefront product."
    >
      <AdminProductForm categories={await getCategories()} />
    </AdminContentShell>
  );
}
