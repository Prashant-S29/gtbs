"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { toast } from "sonner";

import AdminBilingualFormSteps, {
  type AdminContentLanguage,
} from "@/components/admin/AdminBilingualFormSteps";
import AdminGujaratiSuggestion from "@/components/admin/AdminGujaratiSuggestion";
import { adminJsonRequest } from "@/lib/adminContentClient";
import type { Testimonial } from "@/types/testimonial";

interface AdminTestimonialFormProps {
  initialItem?: Testimonial;
}

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10";
const textareaClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10";

export default function AdminTestimonialForm({
  initialItem,
}: AdminTestimonialFormProps) {
  const router = useRouter();
  const [formLanguage, setFormLanguage] = useState<AdminContentLanguage>("en");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const saveTestimonial = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setError("");

    const englishFields = ["name", "role", "review"];
    if (
      englishFields.some((field) => !String(values.get(field) || "").trim())
    ) {
      setFormLanguage("en");
      setError(
        "Complete all required English content fields before continuing.",
      );
      return;
    }
    if (formLanguage === "en") {
      setFormLanguage("gu");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const gujaratiFields = ["gujaratiName", "gujaratiRole", "gujaratiReview"];
    if (
      gujaratiFields.some((field) => !String(values.get(field) || "").trim())
    ) {
      setFormLanguage("gu");
      setError("Complete all required Gujarati content fields before saving.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        name: String(values.get("name") || "").trim(),
        role: String(values.get("role") || "").trim(),
        review: String(values.get("review") || "").trim(),
        rating: Number(values.get("rating")),
        gujarati: {
          name: String(values.get("gujaratiName") || "").trim(),
          role: String(values.get("gujaratiRole") || "").trim(),
          review: String(values.get("gujaratiReview") || "").trim(),
        },
      };
      const url = initialItem
        ? `/api/admin/content/testimonials/${encodeURIComponent(initialItem.id)}`
        : "/api/admin/content/testimonials";
      await adminJsonRequest(url, initialItem ? "PUT" : "POST", payload);
      toast.success(
        initialItem
          ? "Testimonial updated successfully."
          : "Testimonial created successfully.",
      );
      router.push("/admin/testimonials");
      router.refresh();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Testimonial could not be saved.";
      setError(message);
      toast.error(message);
      setBusy(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="text-lg font-bold">
              {initialItem
                ? "Edit testimonial details"
                : "Add a new testimonial"}
            </h2>
            <p className="text-xs text-slate-500">
              Add the customer&apos;s English and Gujarati testimonial content.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <AdminBilingualFormSteps currentStep={formLanguage} />
            <Link
              href="/admin/testimonials"
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Back to list
            </Link>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
      </div>

      <form onSubmit={saveTestimonial} className="grid gap-5 sm:grid-cols-2">
        <fieldset className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 sm:p-6">
          <legend className="px-2 text-base font-bold text-slate-800">
            Common fields
          </legend>
          <p className="text-xs text-slate-500">
            Rating is shared by the English and Gujarati versions.
          </p>
          <label className="max-w-xs text-sm font-semibold">
            Rating
            <select
              name="rating"
              required
              defaultValue={initialItem?.rating || 5}
              className={inputClass}
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} star{rating === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        <fieldset
          className={`${formLanguage === "en" ? "grid" : "hidden"} gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 sm:grid-cols-2 sm:p-6`}
        >
          <legend className="px-2 text-base font-bold text-slate-800">
            English content
          </legend>
          <p className="text-xs text-slate-500 sm:col-span-2">
            Shown while the storefront language is English.
          </p>
          <label className="text-sm font-semibold">
            Customer name
            <input
              name="name"
              required={formLanguage === "en"}
              maxLength={120}
              defaultValue={initialItem?.name}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold">
            Customer role
            <input
              name="role"
              required={formLanguage === "en"}
              maxLength={160}
              defaultValue={initialItem?.role || "Verified Buyer"}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Testimonial
            <textarea
              name="review"
              required={formLanguage === "en"}
              maxLength={2000}
              rows={6}
              defaultValue={initialItem?.review}
              className={textareaClass}
            />
          </label>
        </fieldset>

        <fieldset
          className={`${formLanguage === "gu" ? "grid" : "hidden"} gap-4 rounded-2xl border border-orange-200 bg-orange-50/30 p-5 shadow-sm sm:col-span-2 sm:grid-cols-2 sm:p-6`}
          lang="gu"
        >
          <legend className="px-2 text-base font-bold text-orange-700">
            Gujarati content
          </legend>
          <p className="text-xs text-slate-600 sm:col-span-2">
            This saved content is shown when the storefront language is
            Gujarati.
          </p>
          <div>
            <label
              htmlFor="testimonial-gujarati-name"
              className="text-sm font-semibold"
            >
              Gujarati customer name
            </label>
            <input
              id="testimonial-gujarati-name"
              name="gujaratiName"
              required={formLanguage === "gu"}
              maxLength={120}
              defaultValue={initialItem?.gujarati?.name}
              className={inputClass}
            />
            <AdminGujaratiSuggestion
              active={formLanguage === "gu"}
              sourceName="name"
              targetName="gujaratiName"
            />
          </div>
          <div>
            <label
              htmlFor="testimonial-gujarati-role"
              className="text-sm font-semibold"
            >
              Gujarati customer role
            </label>
            <input
              id="testimonial-gujarati-role"
              name="gujaratiRole"
              required={formLanguage === "gu"}
              maxLength={160}
              defaultValue={initialItem?.gujarati?.role}
              className={inputClass}
            />
            <AdminGujaratiSuggestion
              active={formLanguage === "gu"}
              sourceName="role"
              targetName="gujaratiRole"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="testimonial-gujarati-review"
              className="text-sm font-semibold"
            >
              Gujarati testimonial
            </label>
            <textarea
              id="testimonial-gujarati-review"
              name="gujaratiReview"
              required={formLanguage === "gu"}
              maxLength={2000}
              rows={6}
              defaultValue={initialItem?.gujarati?.review}
              className={textareaClass}
            />
            <AdminGujaratiSuggestion
              active={formLanguage === "gu"}
              sourceName="review"
              targetName="gujaratiReview"
            />
          </div>
        </fieldset>

        <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
          <Link
            href="/admin/testimonials"
            className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>
          {formLanguage === "gu" && (
            <button
              type="button"
              onClick={() => {
                setError("");
                setFormLanguage("en");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={busy}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              <ArrowLeft size={17} />
              Previous
            </button>
          )}
          <button
            type="submit"
            disabled={busy}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {formLanguage === "en" ? (
              <ArrowRight size={17} />
            ) : (
              <Save size={17} />
            )}
            {formLanguage === "en"
              ? "Next"
              : busy
                ? "Saving..."
                : initialItem
                  ? "Update testimonial"
                  : "Create testimonial"}
          </button>
        </div>
      </form>
    </section>
  );
}
