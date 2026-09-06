import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminContentShell from "@/components/admin/AdminContentShell";
import AdminGalleryManager from "@/components/admin/gallery/AdminGalleryManager";
import { getCurrentAdminSession } from "@/lib/adminAuth";
import { getGalleries } from "@/lib/contentRepository";

export const metadata: Metadata = { title: "Manage Gallery" };
export const dynamic = "force-dynamic";

export default async function AdminGalleriesPage() {
  if (!(await getCurrentAdminSession())) redirect("/admin/login");
  return (
    <AdminContentShell
      title="Gallery management"
      description="Manage albums, cover images, and up to 12 photos per album."
    >
      <AdminGalleryManager initialItems={await getGalleries()} />
    </AdminContentShell>
  );
}
