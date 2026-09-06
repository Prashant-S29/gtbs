"use client";

import { FormEvent, useRef, useState } from "react";
import { Globe2, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ContactForm = () => {
  const { t } = useLanguage();
  const form = useRef<HTMLFormElement>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const sendEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.current) return;

    setLoading(true);
    setSuccess("");
    setError("");

    const formData = new FormData(form.current);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-GTBS-Public-Request": "1",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          email: formData.get("email"),
          message: formData.get("message"),
          website: formData.get("website"),
        }),
      });

      if (!response.ok) throw new Error();
      setSuccess(t("contact.form.success"));
      form.current.reset();
    } catch {
      setError(t("contact.form.failure"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 rounded-lg bg-orange-50 p-6 lg:grid-cols-2">
          {/* ================= LEFT: CONTACT FORM ================= */}

          <div className="rounded-2xl border border-gray-300 bg-white p-6 sm:p-6 lg:p-8">
            <h2 className="title text-3xl text-gray-900 sm:text-4xl">
              {t("contact.form.title")}
            </h2>

            <p className="mt-3 description leading-6 text-gray-600">
              {t("contact.form.description")}
            </p>

            <form
              ref={form}
              onSubmit={sendEmail}
              aria-busy={loading}
              className="mt-6 space-y-5"
            >
              {/* Name + Phone */}
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Name */}
                <div>
                  <label htmlFor="contact-name" className="sr-only">
                    {t("contact.form.name")}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder={t("contact.form.namePlaceholder")}
                    required
                    maxLength={100}
                    className="h-13 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none transition focus:border-orange-600 focus:ring-1 focus:ring-orange-600"
                  />
                </div>

                {/* Phone */}
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-2 text-gray-600">
                    <Globe2 size={19} />
                    <span>+91</span>
                  </div>

                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    autoComplete="tel-national"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    placeholder={t("contact.form.phonePlaceholder")}
                    required
                    aria-label={t("contact.form.phoneLabel")}
                    className="h-13 w-full rounded-xl border border-gray-300 pl-24 pr-4 text-sm outline-none transition focus:border-orange-600 focus:ring-1 focus:ring-orange-600"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="contact-email" className="sr-only">
                  {t("contact.form.email")}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  maxLength={254}
                  placeholder={t("contact.form.emailPlaceholder")}
                  required
                  className="h-13 w-full rounded-xl border border-gray-300 px-4 text-sm outline-none transition focus:border-orange-600 focus:ring-1 focus:ring-orange-600"
                />
              </div>

              {/* Message */}
              <textarea
                id="contact-message"
                name="message"
                placeholder={t("contact.form.messagePlaceholder")}
                required
                maxLength={2_000}
                aria-label={t("contact.form.message")}
                rows={5}
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-4 text-sm outline-none transition focus:border-orange-600 focus:ring-1 focus:ring-orange-600"
              />

              <div className="hidden" aria-hidden="true">
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Success Message */}
              {success && (
                <div
                  role="status"
                  className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
                >
                  {success}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                >
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 text-base font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
                    />
                    {t("contact.form.sending")}
                  </>
                ) : (
                  <>
                    {t("contact.form.send")}
                    <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ================= RIGHT: GOOGLE MAP ================= */}
          <div className="h-full overflow-hidden rounded-2xl border border-gray-300 bg-white p-5">
            <iframe
              src="https://www.google.com/maps?q=Sahitya%20Seva%20Sadan,%20Shahid%20Veer%20Kinariwala%20Marg,%20Ellisbridge,%20Ahmedabad,%20Gujarat%20380006&output=embed"
              width="100%"
              height="100%"
              style={{
                border: 0,
                minHeight: "450px",
              }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              title={t("contact.mapTitle")}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
