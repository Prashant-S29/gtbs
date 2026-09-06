"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import VisionMissionImage from "../../../public/images/about/VisionMission.webp";
import { useLanguage } from "@/contexts/LanguageContext";

const VisionMission = () => {
  const { t } = useLanguage();

  return (
    <section
      aria-labelledby="vision-mission-heading"
      className="py-10 md:py-14"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-[18px] bg-orange-50 p-5 shadow-[0_4px_25px_rgba(0,0,0,0.04)] md:p-7 lg:p-8">
          <div className="grid items-stretch gap-6 md:grid-cols-3 lg:gap-8">
            {/* ================= VISION ================= */}
            <article className="flex h-full flex-col rounded-xl bg-white p-6 md:p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-orange-600 md:text-xs">
                {t("about.vision.badge")}
              </p>

              <h2
                id="vision-mission-heading"
                className="title mt-3 text-[28px] font-bold leading-[1.15] tracking-tight text-gray-900 sm:text-[32px] md:text-[34px] lg:text-[36px]"
              >
                {t("about.vision.title")}
              </h2>

              <p className="description mt-5 text-[13px] leading-6 text-gray-600 md:text-sm md:leading-6">
                {t("about.vision.description")}
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2
                    size={17}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-orange-600"
                    aria-hidden="true"
                  />
                  <span className="description text-[14px] font-medium text-gray-600">
                    {t("about.vision.point1")}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2
                    size={17}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-orange-600"
                    aria-hidden="true"
                  />
                  <span className="description text-[14px] font-medium text-gray-600">
                    {t("about.vision.point2")}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2
                    size={17}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-orange-600"
                    aria-hidden="true"
                  />
                  <span className="description text-[14px] font-medium text-gray-600">
                    {t("about.vision.point3")}
                  </span>
                </div>
              </div>
            </article>

            {/* ================= IMAGE ================= */}
            <div className="relative w-full overflow-hidden rounded-xl h-[400px]">
              <Image
                src={VisionMissionImage}
                alt={t("about.mission.imageAlt")}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>

            {/* ================= MISSION ================= */}
            <article className="flex h-full flex-col rounded-xl bg-white p-6 md:p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-orange-600 md:text-xs">
                {t("about.mission.badge")}
              </p>

              <h3 className="title mt-3 text-[28px] font-bold leading-[1.15] tracking-tight text-gray-900 sm:text-[32px] md:text-[34px] lg:text-[36px]">
                {t("about.mission.title")}
              </h3>

              <p className="description mt-5 text-[13px] leading-6 text-gray-600 md:text-sm md:leading-6">
                {t("about.mission.description")}
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2
                    size={17}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-orange-600"
                    aria-hidden="true"
                  />
                  <span className="description text-[14px] font-medium text-gray-600">
                    {t("about.mission.point1")}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2
                    size={17}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-orange-600"
                    aria-hidden="true"
                  />
                  <span className="description text-[14px] font-medium text-gray-600">
                    {t("about.mission.point2")}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2
                    size={17}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-orange-600"
                    aria-hidden="true"
                  />
                  <span className="description text-[14px] font-medium text-gray-600">
                    {t("about.mission.point3")}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionMission;
