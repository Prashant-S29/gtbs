"use client";

import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeTeamMember } from "@/lib/localizedTeam";
import type { TeamMember } from "@/types/team";

interface TeamProps {
  members: TeamMember[];
}

const Team = ({ members }: TeamProps) => {
  const { language, t } = useLanguage();

  if (members.length === 0) return null;

  return (
    <section aria-labelledby="team-heading" className="bg-white py-10">
      <div className="container mx-auto px-4 lg:px-6">
        {/* ================= HEADING ================= */}
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="team-heading"
            className="title text-[30px] font-bold leading-tight tracking-tight text-orange-600 sm:text-[34px] md:text-[40px]"
          >
            {t("about.team.title")}
          </h2>

          <p className="description mt-3 text-sm leading-6 text-gray-600 md:text-[15px]">
            {t("about.team.description")}
          </p>
        </div>

        {/* ================= TEAM GRID ================= */}
        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((sourceMember) => {
            const member = localizeTeamMember(sourceMember, language);
            const usesStoredGujarati =
              language === "gu" && Boolean(sourceMember.gujarati);

            return (
              <article
                key={member.id}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-orange-100 hover:shadow-[0_12px_30px_rgba(0,0,0,0.07)]"
              >
                <div className="relative h-[260px] w-full overflow-hidden sm:h-[280px] lg:h-[290px]">
                  <Image
                    src={member.image}
                    alt={`${member.name} - ${member.role}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div
                  className={
                    usesStoredGujarati ? "notranslate px-5 py-5" : "px-5 py-5"
                  }
                  translate={usesStoredGujarati ? "no" : undefined}
                  lang={usesStoredGujarati ? "gu" : undefined}
                >
                  <h3 className="title text-[17px] font-bold text-gray-900">
                    {member.name}
                  </h3>

                  <p className="description mt-1 text-[13px] font-medium text-orange-600 md:text-sm">
                    {member.role}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Team;
