"use client";

import Image from "next/image";
import Link from "next/link";
import Banner from "../../../public/images/banners/Home_banner.webp";
import { useLanguage } from "@/contexts/LanguageContext";

function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="py-4">
      <div className=" container px-3 lg:px-6 overflow-hidden ">
        <div className="relative overflow-hidden rounded-xl bg-gray-900">
          <Image
            src={Banner}
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 1536px) 100vw, 1440px"
            className="object-cover object-center"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/45" />

          {/* Content */}
          <div className="home-hero-content relative z-10 flex min-h-[400px] items-center px-8 py-10 sm:px-10 lg:px-10">
            <div className="max-w-5xl text-white">
              <div className="home-hero-heading-group flex flex-col items-start gap-6">
                {/* Badge */}
                <div className="inline-flex description rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                  {t("home.hero.badge")}
                </div>

                {/* Heading */}
                <h1 className="home-hero-title max-w-4xl title text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-[48px]">
                  {t("home.hero.titleLine1")}
                  <br />
                  {t("home.hero.titleLine2")}
                </h1>
              </div>

              {/* Description */}
              <p className="home-hero-description mt-5 max-w-6xl text-base leading-6 description text-white sm:text-md">
                {t("home.hero.description")}
              </p>

              {/* Buttons */}
              <div className="home-hero-actions mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex min-w-[140px] items-center justify-center rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-orange-600"
                >
                  {t("home.hero.contact")}
                </Link>

                <Link
                  href="/allproducts"
                  className="inline-flex min-w-[160px] items-center justify-center rounded-lg border-2 border-white bg-transparent px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white hover:text-gray-900"
                >
                  {t("home.hero.browse")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
