"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ImageUp, Save } from "lucide-react";
import { toast } from "sonner";

import AdminBilingualFormSteps, {
  type AdminContentLanguage,
} from "@/components/admin/AdminBilingualFormSteps";
import {
  adminJsonRequest,
  uploadAdminImages,
  validateClientImages,
} from "@/lib/adminContentClient";
import type { TeamMember } from "@/types/team";

interface AdminTeamMemberFormProps {
  initialItem?: TeamMember;
}

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10";

export default function AdminTeamMemberForm({
  initialItem,
}: AdminTeamMemberFormProps) {
  const router = useRouter();
  const [formLanguage, setFormLanguage] = useState<AdminContentLanguage>("en");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const chooseImage = (file: File | undefined, input: HTMLInputElement) => {
    if (!file) {
      setImageFile(null);
      setImageError("");
      return;
    }
    const validationError = validateClientImages([file]);
    if (validationError) {
      setImageFile(null);
      setImageError(validationError);
      input.value = "";
      return;
    }
    setImageFile(file);
    setImageError("");
  };

  const saveTeamMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setError("");

    if (
      ["name", "role"].some((field) => !String(values.get(field) || "").trim())
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
    if (
      ["gujaratiName", "gujaratiRole"].some(
        (field) => !String(values.get(field) || "").trim(),
      )
    ) {
      setFormLanguage("gu");
      setError("Complete all required Gujarati content fields before saving.");
      return;
    }

    setBusy(true);
    try {
      let image = initialItem?.image || "";
      let imageKey = initialItem?.imageKey;
      if (imageFile) {
        const [uploaded] = await uploadAdminImages("team-member-image", [
          imageFile,
        ]);
        image = uploaded.url;
        imageKey = uploaded.key;
      }
      if (!image) throw new Error("Choose a team member image before saving.");

      const payload = {
        name: String(values.get("name") || "").trim(),
        role: String(values.get("role") || "").trim(),
        image,
        ...(imageKey ? { imageKey } : {}),
        gujarati: {
          name: String(values.get("gujaratiName") || "").trim(),
          role: String(values.get("gujaratiRole") || "").trim(),
        },
      };
      const url = initialItem
        ? `/api/admin/content/team/${encodeURIComponent(initialItem.id)}`
        : "/api/admin/content/team";
      await adminJsonRequest(url, initialItem ? "PUT" : "POST", payload);
      toast.success(
        initialItem
          ? "Team member updated successfully."
          : "Team member created successfully.",
      );
      router.push("/admin/team");
      router.refresh();
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Team member could not be saved.";
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
                ? "Edit team member details"
                : "Add a new team member"}
            </h2>
            <p className="text-xs text-slate-500">
              Add the member&apos;s image and bilingual profile details.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <AdminBilingualFormSteps currentStep={formLanguage} />
            <Link
              href="/admin/team"
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

      <form onSubmit={saveTeamMember} className="grid gap-5 sm:grid-cols-2">
        <fieldset className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 sm:p-6">
          <legend className="px-2 text-base font-bold text-slate-800">
            Common fields
          </legend>
          <p className="text-xs text-slate-500">
            The member image is shared by the English and Gujarati versions.
          </p>
          <label className="text-sm font-semibold">
            Member image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={!initialItem?.image}
              aria-invalid={Boolean(imageError)}
              aria-describedby={
                imageError ? "team-member-image-error" : undefined
              }
              onChange={(event) =>
                chooseImage(event.currentTarget.files?.[0], event.currentTarget)
              }
              className={`mt-1.5 block w-full rounded-xl border border-dashed p-3 text-sm ${imageError ? "border-red-400 bg-red-50/40" : "border-slate-300"}`}
            />
            <span className="mt-1 flex items-center gap-1 text-xs font-normal text-slate-500">
              <ImageUp size={13} />
              {imageFile?.name ||
                (initialItem?.image
                  ? "Current image will be kept."
                  : "Choose an image.")}
            </span>
            {imageError && (
              <span
                id="team-member-image-error"
                role="alert"
                className="mt-1.5 block text-xs font-medium text-red-600"
              >
                {imageError}
              </span>
            )}
          </label>
          {initialItem?.image && !imageFile && (
            <div className="relative h-32 w-32 overflow-hidden rounded-xl bg-slate-100">
              <Image
                src={initialItem.image}
                alt="Current team member"
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          )}
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
            Member name
            <input
              name="name"
              required={formLanguage === "en"}
              maxLength={120}
              defaultValue={initialItem?.name}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold">
            Member role
            <input
              name="role"
              required={formLanguage === "en"}
              maxLength={160}
              defaultValue={initialItem?.role}
              className={inputClass}
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
          <label className="text-sm font-semibold">
            Gujarati member name
            <input
              name="gujaratiName"
              required={formLanguage === "gu"}
              maxLength={120}
              defaultValue={initialItem?.gujarati?.name}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold">
            Gujarati member role
            <input
              name="gujaratiRole"
              required={formLanguage === "gu"}
              maxLength={160}
              defaultValue={initialItem?.gujarati?.role}
              className={inputClass}
            />
          </label>
        </fieldset>

        <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
          <Link
            href="/admin/team"
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
            disabled={busy || Boolean(imageError)}
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
                  ? "Update team member"
                  : "Create team member"}
          </button>
        </div>
      </form>
    </section>
  );
}
