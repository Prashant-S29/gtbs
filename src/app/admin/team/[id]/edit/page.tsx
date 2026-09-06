import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import AdminContentShell from "@/components/admin/AdminContentShell";
import AdminTeamMemberForm from "@/components/admin/team/AdminTeamMemberForm";
import { getCurrentAdminSession } from "@/lib/adminAuth";
import { getTeamMember } from "@/lib/contentRepository";

export const metadata: Metadata = { title: "Edit Team Member" };
export const dynamic = "force-dynamic";

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await getCurrentAdminSession())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const teamMember = await getTeamMember(decodeURIComponent(id));
  if (!teamMember) notFound();

  return (
    <AdminContentShell
      title="Edit team member"
      description="Update the shared image and bilingual profile details."
    >
      <AdminTeamMemberForm initialItem={teamMember} />
    </AdminContentShell>
  );
}
