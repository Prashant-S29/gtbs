import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminContentShell from "@/components/admin/AdminContentShell";
import AdminCategoryManager from "@/components/admin/category/AdminCategoryManager";
import { getCurrentAdminSession } from "@/lib/adminAuth";
import { getCategories, getProducts } from "@/lib/contentRepository";

export const metadata: Metadata = { title: "Manage Categories" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  if (!(await getCurrentAdminSession())) redirect("/admin/login");
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);
  return (
    <AdminContentShell
      title="Category management"
      description="Maintain the category list used by products."
    >
      <AdminCategoryManager initialItems={categories} products={products} />
    </AdminContentShell>
  );
}
