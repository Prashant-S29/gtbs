import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import AdminContentShell from "@/components/admin/AdminContentShell";
import AdminTestimonialForm from "@/components/admin/testimonial/AdminTestimonialForm";
import { getCurrentAdminSession } from "@/lib/adminAuth";
import { getTestimonial } from "@/lib/contentRepository";

interface EditTestimonialPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Edit Testimonial" };
export const dynamic = "force-dynamic";

export default async function EditTestimonialPage({
  params,
}: EditTestimonialPageProps) {
  if (!(await getCurrentAdminSession())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const testimonial = await getTestimonial(id);
  if (!testimonial) notFound();

  return (
    <AdminContentShell
      title="Edit testimonial"
      description="Update this bilingual homepage testimonial."
    >
      <AdminTestimonialForm initialItem={testimonial} />
    </AdminContentShell>
  );
}
