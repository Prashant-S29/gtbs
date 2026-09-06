"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ImageUp, Save } from "lucide-react";
import { toast } from "sonner";

import AdminRichTextEditor from "@/components/admin/blog/AdminRichTextEditor";
import AdminBilingualFormSteps, {
  type AdminContentLanguage,
} from "@/components/admin/AdminBilingualFormSteps";
import type { BlogPost } from "@/types/blog";
import {
  blogRichTextToPlainText,
  blogToGujaratiRichText,
  blogToRichText,
  MAX_BLOG_CONTENT_CHARACTERS,
  MAX_BLOG_RICH_TEXT_JSON_CHARACTERS,
} from "@/lib/blogRichText";
import {
  adminJsonRequest,
  uploadAdminImages,
  validateClientImages,
} from "@/lib/adminContentClient";

interface AdminBlogFormProps {
  initialItem?: BlogPost;
}

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10";

export default function AdminBlogForm({ initialItem }: AdminBlogFormProps) {
  const router = useRouter();
  const [formLanguage, setFormLanguage] = useState<AdminContentLanguage>("en");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [articleError, setArticleError] = useState("");
  const [gujaratiArticleError, setGujaratiArticleError] = useState("");
  const [bannerError, setBannerError] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [richContent, setRichContent] = useState(() =>
    blogToRichText(initialItem),
  );
  const [gujaratiRichContent, setGujaratiRichContent] = useState(() =>
    blogToGujaratiRichText(initialItem),
  );

  const chooseBanner = (file: File | undefined, input: HTMLInputElement) => {
    if (!file) {
      setBannerFile(null);
      setBannerError("");
      return;
    }
    const validationError = validateClientImages([file]);
    if (validationError) {
      setBannerError(validationError);
      input.value = "";
      return;
    }
    setBannerError("");
    setBannerFile(file);
  };

  const chooseAvatar = (file: File | undefined, input: HTMLInputElement) => {
    if (!file) {
      setAvatarFile(null);
      setAvatarError("");
      return;
    }
    const validationError = validateClientImages([file]);
    if (validationError) {
      setAvatarError(validationError);
      input.value = "";
      return;
    }
    setAvatarError("");
    setAvatarFile(file);
  };

  const saveBlog = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setError("");
    const englishFields = ["title", "category", "authorName", "authorRole"];
    if (
      englishFields.some((field) => !String(values.get(field) || "").trim())
    ) {
      setFormLanguage("en");
      setError(
        "Complete all required English content fields before continuing.",
      );
      return;
    }
    const contentText = blogRichTextToPlainText(richContent).trim();
    if (!contentText) {
      setFormLanguage("en");
      setArticleError("Add article content before continuing.");
      return;
    }
    if (
      contentText.length > MAX_BLOG_CONTENT_CHARACTERS ||
      JSON.stringify(richContent).length > MAX_BLOG_RICH_TEXT_JSON_CHARACTERS
    ) {
      setFormLanguage("en");
      setArticleError("Article content is too long.");
      return;
    }
    if (formLanguage === "en") {
      setArticleError("");
      setFormLanguage("gu");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const gujaratiFields = [
      "gujaratiTitle",
      "gujaratiCategory",
      "gujaratiAuthorName",
      "gujaratiAuthorRole",
    ];
    if (
      gujaratiFields.some((field) => !String(values.get(field) || "").trim())
    ) {
      setError("Complete all required Gujarati content fields before saving.");
      return;
    }
    const gujaratiContentText =
      blogRichTextToPlainText(gujaratiRichContent).trim();
    if (!gujaratiContentText) {
      setGujaratiArticleError("Add Gujarati article content before saving.");
      return;
    }
    if (
      gujaratiContentText.length > MAX_BLOG_CONTENT_CHARACTERS ||
      JSON.stringify(gujaratiRichContent).length >
        MAX_BLOG_RICH_TEXT_JSON_CHARACTERS
    ) {
      setGujaratiArticleError("Gujarati article content is too long.");
      return;
    }

    setBusy(true);
    setError("");
    setArticleError("");
    setGujaratiArticleError("");
    try {
      let image = initialItem?.image || "";
      let imageKey = initialItem?.imageKey;
      if (bannerFile) {
        const [uploaded] = await uploadAdminImages("blog-banner", [bannerFile]);
        image = uploaded.url;
        imageKey = uploaded.key;
      }
      if (!image) throw new Error("Choose a banner image before saving.");

      let avatar = initialItem?.author.avatar || "/images/logo/logo.webp";
      if (avatarFile) {
        const [uploaded] = await uploadAdminImages("blog-avatar", [avatarFile]);
        avatar = uploaded.url;
      }

      const title = String(values.get("title") || "").trim();
      const payload = {
        title,
        category: String(values.get("category") || "").trim(),
        date: String(values.get("date") || "").trim(),
        image,
        ...(imageKey ? { imageKey } : {}),
        summary: "",
        author: {
          name: String(values.get("authorName") || "").trim(),
          role: String(values.get("authorRole") || "").trim(),
          avatar,
          bio: "",
        },
        contentText,
        richContent,
        gujarati: {
          title: String(values.get("gujaratiTitle") || "").trim(),
          category: String(values.get("gujaratiCategory") || "").trim(),
          author: {
            name: String(values.get("gujaratiAuthorName") || "").trim(),
            role: String(values.get("gujaratiAuthorRole") || "").trim(),
            bio: "",
          },
          contentText: gujaratiContentText,
          richContent: gujaratiRichContent,
        },
      };
      const url = initialItem
        ? `/api/admin/content/blogs/${encodeURIComponent(String(initialItem.id))}`
        : "/api/admin/content/blogs";
      await adminJsonRequest(url, initialItem ? "PUT" : "POST", payload);
      toast.success(
        initialItem
          ? "Blog updated successfully."
          : "Blog created successfully.",
      );
      router.push("/admin/blogs");
      router.refresh();
    } catch (saveError) {
      const errorMessage =
        saveError instanceof Error
          ? saveError.message
          : "Blog could not be saved.";
      setError(errorMessage);
      toast.error(errorMessage);
      setBusy(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="text-lg font-bold">
              {initialItem ? "Edit blog details" : "Add a new blog"}
            </h2>
            <p className="text-xs text-slate-500">
              Banner: JPG, PNG, or WebP; maximum 500 KB.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <AdminBilingualFormSteps currentStep={formLanguage} />
            <Link
              href="/admin/blogs"
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

      <form onSubmit={saveBlog} className="grid gap-5 sm:grid-cols-2">
        <fieldset className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 sm:grid-cols-2 sm:p-6">
          <legend className="px-2 text-base font-bold text-slate-800">
            Common fields
          </legend>
          <p className="sm:col-span-2 text-xs text-slate-500">
            These values are shared by the English and Gujarati versions.
          </p>
          <label className="min-w-0 text-sm font-semibold sm:col-span-2">
            Date
            <input
              name="date"
              required
              defaultValue={
                initialItem?.date || new Date().toISOString().slice(0, 10)
              }
              className={inputClass}
            />
          </label>
          <label className="sm:col-span-2 text-sm font-semibold">
            Banner image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={!initialItem?.image}
              aria-invalid={Boolean(bannerError)}
              aria-describedby={bannerError ? "blog-banner-error" : undefined}
              onChange={(event) =>
                chooseBanner(
                  event.currentTarget.files?.[0],
                  event.currentTarget,
                )
              }
              className={`mt-1.5 block w-full rounded-xl border border-dashed p-3 text-sm ${bannerError ? "border-red-400 bg-red-50/40" : "border-slate-300"}`}
            />
            <span className="mt-1 flex items-center gap-1 text-xs font-normal text-slate-500">
              <ImageUp size={13} />
              {bannerFile?.name ||
                (initialItem?.image
                  ? "Current banner will be kept."
                  : "Choose an image.")}
            </span>
            {bannerError && (
              <span
                id="blog-banner-error"
                role="alert"
                className="mt-1.5 block text-xs font-medium text-red-600"
              >
                {bannerError}
              </span>
            )}
          </label>
          <label className="sm:col-span-2 text-sm font-semibold">
            Author avatar image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-invalid={Boolean(avatarError)}
              aria-describedby={avatarError ? "blog-avatar-error" : undefined}
              onChange={(event) =>
                chooseAvatar(
                  event.currentTarget.files?.[0],
                  event.currentTarget,
                )
              }
              className={`mt-1.5 block w-full rounded-xl border border-dashed p-3 text-sm ${avatarError ? "border-red-400 bg-red-50/40" : "border-slate-300"}`}
            />
            <span className="mt-1 flex items-center gap-1 text-xs font-normal text-slate-500">
              <ImageUp size={13} />
              {avatarFile?.name ||
                (initialItem?.author.avatar
                  ? "Current avatar will be kept."
                  : "No avatar selected — default example image will be used.")}
            </span>
            {avatarError && (
              <span
                id="blog-avatar-error"
                role="alert"
                className="mt-1.5 block text-xs font-medium text-red-600"
              >
                {avatarError}
              </span>
            )}
          </label>
        </fieldset>
        <fieldset
          className={`${formLanguage === "en" ? "grid" : "hidden"} gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 sm:grid-cols-2 sm:p-6`}
        >
          <legend className="px-2 text-base font-bold text-slate-800">
            English content
          </legend>
          <p className="sm:col-span-2 text-xs text-slate-500">
            Shown while the storefront language is English.
          </p>
          <label className="sm:col-span-2 text-sm font-semibold">
            Title
            <input
              name="title"
              required={formLanguage === "en"}
              maxLength={220}
              defaultValue={initialItem?.title}
              className={inputClass}
            />
          </label>
          <label className="sm:col-span-2 text-sm font-semibold">
            Category
            <input
              name="category"
              required={formLanguage === "en"}
              maxLength={100}
              defaultValue={initialItem?.category}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold">
            Author name
            <input
              name="authorName"
              required={formLanguage === "en"}
              defaultValue={initialItem?.author.name || "GTBS Editorial Team"}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold">
            Author role
            <input
              name="authorRole"
              required={formLanguage === "en"}
              defaultValue={initialItem?.author.role || "Editor"}
              className={inputClass}
            />
          </label>
          <div className="sm:col-span-2">
            <p className="mb-1.5 text-sm font-semibold">Article content</p>
            <AdminRichTextEditor
              initialContent={richContent}
              error={articleError}
              onChange={(content) => {
                setRichContent(content);
                if (articleError) setArticleError("");
              }}
            />
          </div>
        </fieldset>
        <fieldset
          className={`${formLanguage === "gu" ? "grid" : "hidden"} gap-4 rounded-2xl border border-orange-200 bg-orange-50/30 p-5 shadow-sm sm:col-span-2 sm:grid-cols-2 sm:p-6`}
        >
          <legend className="px-2 text-base font-bold text-orange-700">
            Gujarati content
          </legend>
          <p className="sm:col-span-2 text-xs text-slate-600">
            This saved content is shown when the storefront language is
            Gujarati.
          </p>
          <label className="sm:col-span-2 text-sm font-semibold">
            Gujarati title
            <input
              name="gujaratiTitle"
              lang="gu"
              required={formLanguage === "gu"}
              maxLength={220}
              defaultValue={initialItem?.gujarati?.title}
              className={inputClass}
            />
          </label>
          <label className="sm:col-span-2 text-sm font-semibold">
            Gujarati category
            <input
              name="gujaratiCategory"
              lang="gu"
              required={formLanguage === "gu"}
              maxLength={100}
              defaultValue={initialItem?.gujarati?.category}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold">
            Gujarati author name
            <input
              name="gujaratiAuthorName"
              lang="gu"
              required={formLanguage === "gu"}
              maxLength={120}
              defaultValue={initialItem?.gujarati?.author.name}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-semibold">
            Gujarati author role
            <input
              name="gujaratiAuthorRole"
              lang="gu"
              required={formLanguage === "gu"}
              maxLength={160}
              defaultValue={initialItem?.gujarati?.author.role}
              className={inputClass}
            />
          </label>
          <div className="sm:col-span-2" lang="gu">
            <p className="mb-1.5 text-sm font-semibold">
              Gujarati article content
            </p>
            <AdminRichTextEditor
              initialContent={gujaratiRichContent}
              error={gujaratiArticleError}
              ariaLabel="Gujarati article content"
              onChange={(content) => {
                setGujaratiRichContent(content);
                if (gujaratiArticleError) setGujaratiArticleError("");
              }}
            />
          </div>
        </fieldset>
        <div className="sm:col-span-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link
            href="/admin/blogs"
            className="flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
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
            disabled={busy || Boolean(bannerError) || Boolean(avatarError)}
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
                  ? "Update blog"
                  : "Create blog"}
          </button>
        </div>
      </form>
    </section>
  );
}
