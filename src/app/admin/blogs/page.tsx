import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminBlogManager from "@/components/admin/blog/AdminBlogManager";
import AdminContentShell from "@/components/admin/AdminContentShell";
import { getCurrentAdminSession } from "@/lib/adminAuth";
import { getBlogs } from "@/lib/contentRepository";

export const metadata: Metadata = { title: "Manage Blogs" };
export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  if (!(await getCurrentAdminSession())) redirect("/admin/login");
  return (
    <AdminContentShell
      title="Blog management"
      description="Create, edit, and remove public journal articles."
    >
      <AdminBlogManager initialItems={await getBlogs()} />
    </AdminContentShell>
  );
}
