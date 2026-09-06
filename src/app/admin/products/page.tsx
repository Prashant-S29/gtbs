import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminContentShell from "@/components/admin/AdminContentShell";
import AdminProductManager from "@/components/admin/product/AdminProductManager";
import { getCurrentAdminSession } from "@/lib/adminAuth";
import { getCategories, getProducts } from "@/lib/contentRepository";

export const metadata: Metadata = { title: "Manage Products" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  if (!(await getCurrentAdminSession())) redirect("/admin/login");
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  return (
    <AdminContentShell
      title="Product management"
      description="Create, edit, and remove storefront products."
    >
      <AdminProductManager initialItems={products} categories={categories} />
    </AdminContentShell>
  );
}
