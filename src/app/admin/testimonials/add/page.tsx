import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminContentShell from "@/components/admin/AdminContentShell";
import AdminTestimonialForm from "@/components/admin/testimonial/AdminTestimonialForm";
import { getCurrentAdminSession } from "@/lib/adminAuth";

export const metadata: Metadata = { title: "Add Testimonial" };

export default async function AddTestimonialPage() {
  if (!(await getCurrentAdminSession())) {
    redirect("/admin/login");
  }

  return (
    <AdminContentShell
      title="Add testimonial"
      description="Create a new bilingual homepage testimonial."
    >
      <AdminTestimonialForm />
    </AdminContentShell>
  );
}
