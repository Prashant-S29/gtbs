"use client";

import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

import ContactImage from "../../../public/images/contact/contact.webp";

const ContactSection = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-10">
      <div className="container px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <div>
            {/* Small Heading */}
            <p className="mb-5 text-sm font-bold uppercase tracking-wide text-orange-600">
              {t("contact.badge")}
            </p>

            {/* Main Heading */}
            <h1 className="title text-4xl font-bold leading-[1.15] tracking-tight text-black sm:text-5xl">
              {t("contact.title")}
            </h1>

            {/* Description */}
            <p className="mt-5 description leading-7 text-gray-700 sm:text-lg">
              {t("contact.description")}
            </p>

            {/* Contact Details */}
            <div className="mt-9 grid gap-x-5 gap-y-8 sm:grid-cols-2">
              {/* Email */}
              <a
                href="mailto:support@gtbsbooks.com"
                className="group flex items-center gap-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white transition-transform duration-300 group-hover:scale-105">
                  <Mail size={21} strokeWidth={2} />
                </div>

                <div>
                  <h3 className="title font-bold text-gray-900">
                    {t("contact.email")}
                  </h3>

                  <p className="mt-1 description text-sm text-gray-600 transition-colors group-hover:text-orange-600">
                    support@gtbsbooks.com
                  </p>
                </div>
              </a>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white">
                  <Phone size={21} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <h3 className="title font-bold text-gray-900">
                    {t("contact.call")}
                  </h3>

                  <div className="flex flex-nowrap items-center gap-3">
                    <a
                      href="tel:+919265429338"
                      className="notranslate mt-1 whitespace-nowrap text-sm tabular-nums text-gray-600 transition-colors description hover:text-orange-600"
                      translate="no"
                      dir="ltr"
                    >
                      +91 9265429338
                    </a>
                    <span className="shrink-0 text-gray-400">|</span>
                    <a
                      href="tel:+917490028867"
                      className="notranslate whitespace-nowrap text-sm tabular-nums text-gray-600 transition-colors description hover:text-orange-600"
                      translate="no"
                      dir="ltr"
                    >
                      +91 7490028867
                    </a>
                  </div>
                </div>
              </div>

              {/* Address */}
              <a
                href="https://www.google.com/maps/search/?api=1&query=Sahitya+Seva+Sadan,+Shahid+Veer+Kinariwala+Marg,+I+P+Mission+Compound,+Ellisbridge,+Ahmedabad,+Gujarat+380006"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 sm:col-span-2"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white transition-transform duration-300 group-hover:scale-105">
                  <MapPin size={21} strokeWidth={2} />
                </div>

                <div>
                  <h3 className="title font-bold text-gray-900">
                    {t("contact.visit")}
                  </h3>

                  <p className="mt-1 description text-sm leading-6 text-gray-600 transition-colors group-hover:text-orange-600">
                    Sahitya Seva Sadan, Shahid Veer Kinariwala Marg, I P Mission
                    Compound, Ellisbridge, Ahmedabad, Gujarat 380006
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src={ContactImage}
              alt={t("contact.imageAlt")}
              width={900}
              height={650}
              className="h-[420px] w-full object-cover sm:h-[480px]"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
