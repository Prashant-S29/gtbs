import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import AdminBlogForm from "@/components/admin/blog/AdminBlogForm";
import AdminContentShell from "@/components/admin/AdminContentShell";
import { getCurrentAdminSession } from "@/lib/adminAuth";
import { getBlog } from "@/lib/contentRepository";

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Edit Blog" };
export const dynamic = "force-dynamic";

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  if (!(await getCurrentAdminSession())) redirect("/admin/login");

  const { id } = await params;
  const blog = await getBlog(id);
  if (!blog) notFound();

  return (
    <AdminContentShell
      title="Edit blog"
      description="Update this public journal article."
    >
      <AdminBlogForm initialItem={blog} />
    </AdminContentShell>
  );
}
