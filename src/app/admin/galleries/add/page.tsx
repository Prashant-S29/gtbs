import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminContentShell from "@/components/admin/AdminContentShell";
import AdminGalleryForm from "@/components/admin/gallery/AdminGalleryForm";
import { getCurrentAdminSession } from "@/lib/adminAuth";

export const metadata: Metadata = { title: "Add Gallery" };

export default async function AddGalleryPage() {
  if (!(await getCurrentAdminSession())) redirect("/admin/login");

  return (
    <AdminContentShell
      title="Add gallery"
      description="Create a new public gallery album."
    >
      <AdminGalleryForm />
    </AdminContentShell>
  );
}
