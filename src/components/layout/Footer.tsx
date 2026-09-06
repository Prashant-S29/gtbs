"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import Logo from "../../../public/images/logo/logo.webp";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/storefrontI18n";

const quickLinks = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.about", href: "/about" },
  { labelKey: "nav.blogs", href: "/blogs" },
  { labelKey: "nav.gallery", href: "/gallery" },
  { labelKey: "nav.contact", href: "/contact" },
] satisfies Array<{ labelKey: TranslationKey; href: string }>;

const policyLinks = [
  { labelKey: "footer.privacy", href: "/privacy-policy" },
  { labelKey: "footer.terms", href: "/terms-and-conditions" },
  {
    labelKey: "footer.shipping",
    href: "/shipping-and-delivery-policy",
  },
] satisfies Array<{ labelKey: TranslationKey; href: string }>;

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-white text-lg font-semibold">{children}</h3>
      <span className="mt-2 block h-[2px] w-8 bg-amber-400/80 rounded-full" />
    </div>
  );
}

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative bg-black pt-16 pb-8">
      {/* thin gradient accent line at the very top of the footer */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

      <div className="container px-3 lg:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Image
              src={Logo}
              alt={t("common.storeLogo")}
              width={72}
              height={72}
            />
            <p className="text-white/60 font-normal pt-5 text-sm leading-relaxed max-w-xs">
              {t("footer.description")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <FooterHeading>{t("footer.quickLinks")}</FooterHeading>
            <ul className="text-white/60 font-normal text-sm space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-amber-400"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policy Links */}
          <div className="lg:col-span-3">
            <FooterHeading>{t("footer.policyLinks")}</FooterHeading>
            <ul className="text-white/60 font-normal text-sm space-y-3">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-amber-400"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <FooterHeading>{t("footer.contact")}</FooterHeading>
            <ul className="text-white/60 font-normal text-sm space-y-4">
              <li>
                <div className="flex flex-wrap items-center gap-3 text-white/60">
                  <Phone size={16} className="shrink-0 text-amber-400/80" />

                  <Link
                    href="tel:+919265429338"
                    className="transition-colors hover:text-amber-400"
                  >
                    +91 9265429338
                  </Link>

                  <span className="h-5 w-px bg-white/30" />

                  <Link
                    href="tel:+917490028867"
                    className="transition-colors hover:text-amber-400"
                  >
                    +91 7490028867
                  </Link>
                </div>
              </li>
              <li>
                <Link
                  href="mailto:support@gtbsbooks.com"
                  className="flex items-center gap-3 transition-colors hover:text-amber-400"
                >
                  <Mail size={16} className="shrink-0 text-amber-400/80" />
                  support@gtbsbooks.com
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.google.com/maps/search/?api=1&query=Sahitya+Seva+Sadan,+Shahid+Veer+Kinariwala+Marg,+I+P+Mission+Compound,+Ellisbridge,+Ahmedabad,+Gujarat+380006"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 transition-colors hover:text-amber-400"
                >
                  <MapPin
                    size={16}
                    className="mt-0.5 shrink-0 text-amber-400/80"
                  />
                  Sahitya Seva Sadan, Shahid Veer Kinariwala Marg, I P Mission
                  Compound, Ellisbridge, Ahmedabad, Gujarat 380006
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col-reverse items-center gap-4 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
          <p className="text-white/40 text-xs">
            {t("footer.rights", { year: new Date().getFullYear() })}
          </p>
          <p className="text-white/40 text-xs">{t("footer.serving")}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
