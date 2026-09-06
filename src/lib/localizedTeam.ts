import type { TeamMember } from "@/types/team";

export function localizeTeamMember(
  member: TeamMember,
  language: "en" | "gu",
): TeamMember {
  if (language !== "gu" || !member.gujarati) return member;

  return {
    ...member,
    name: member.gujarati.name,
    role: member.gujarati.role,
  };
}
