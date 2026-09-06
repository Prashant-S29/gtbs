import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminContentShell from "@/components/admin/AdminContentShell";
import AdminTeamManager from "@/components/admin/team/AdminTeamManager";
import { getCurrentAdminSession } from "@/lib/adminAuth";
import { getTeamMembers } from "@/lib/contentRepository";

export const metadata: Metadata = { title: "Manage Team" };
export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  if (!(await getCurrentAdminSession())) {
    redirect("/admin/login");
  }

  const teamMembers = await getTeamMembers();

  return (
    <AdminContentShell
      title="Team"
      description="Manage the bilingual team section shown on the About page."
    >
      <AdminTeamManager initialItems={teamMembers} />
    </AdminContentShell>
  );
}
