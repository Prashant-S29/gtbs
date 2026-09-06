import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import AdminContentShell from "@/components/admin/AdminContentShell";
import AdminGalleryForm from "@/components/admin/gallery/AdminGalleryForm";
import { getCurrentAdminSession } from "@/lib/adminAuth";
import { getGallery } from "@/lib/contentRepository";

interface EditGalleryPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Edit Gallery" };
export const dynamic = "force-dynamic";

export default async function EditGalleryPage({
  params,
}: EditGalleryPageProps) {
  if (!(await getCurrentAdminSession())) redirect("/admin/login");

  const { id } = await params;
  const gallery = await getGallery(id);
  if (!gallery) notFound();

  return (
    <AdminContentShell
      title="Edit gallery"
      description="Update this public gallery album."
    >
      <AdminGalleryForm initialItem={gallery} />
    </AdminContentShell>
  );
}
