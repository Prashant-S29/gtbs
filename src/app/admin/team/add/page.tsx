import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminContentShell from "@/components/admin/AdminContentShell";
import AdminTeamMemberForm from "@/components/admin/team/AdminTeamMemberForm";
import { getCurrentAdminSession } from "@/lib/adminAuth";

export const metadata: Metadata = { title: "Add Team Member" };
export const dynamic = "force-dynamic";

export default async function AddTeamMemberPage() {
  if (!(await getCurrentAdminSession())) {
    redirect("/admin/login");
  }

  return (
    <AdminContentShell
      title="Add team member"
      description="Create an English and Gujarati team profile."
    >
      <AdminTeamMemberForm />
    </AdminContentShell>
  );
}
