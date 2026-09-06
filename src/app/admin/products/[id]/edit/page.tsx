import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import AdminContentShell from "@/components/admin/AdminContentShell";
import AdminProductForm from "@/components/admin/product/AdminProductForm";
import { getCurrentAdminSession } from "@/lib/adminAuth";
import { getCategories, getProduct } from "@/lib/contentRepository";

export const metadata: Metadata = { title: "Edit Product" };
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  if (!(await getCurrentAdminSession())) redirect("/admin/login");
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);
  if (!product) notFound();
  return (
    <AdminContentShell
      title="Edit product"
      description="Update storefront product details."
    >
      <AdminProductForm initialItem={product} categories={categories} />
    </AdminContentShell>
  );
}
