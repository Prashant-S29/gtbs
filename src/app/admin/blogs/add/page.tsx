import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminBlogForm from "@/components/admin/blog/AdminBlogForm";
import AdminContentShell from "@/components/admin/AdminContentShell";
import { getCurrentAdminSession } from "@/lib/adminAuth";

export const metadata: Metadata = { title: "Add Blog" };

export default async function AddBlogPage() {
  if (!(await getCurrentAdminSession())) redirect("/admin/login");

  return (
    <AdminContentShell
      title="Add blog"
      description="Create a new public journal article."
    >
      <AdminBlogForm />
    </AdminContentShell>
  );
}
