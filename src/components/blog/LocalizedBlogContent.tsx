"use client";

import Breadcrumb from "@/components/common/Breadcrumb";
import BlogRichText from "@/components/blog/BlogRichText";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeBlog } from "@/lib/localizedBlog";
import type { BlogPost } from "@/types/blog";

type LocalizedTextField = "title" | "category" | "authorName" | "authorRole";

export function LocalizedBlogText({
  blog,
  field,
}: {
  blog: BlogPost;
  field: LocalizedTextField;
}) {
  const { language } = useLanguage();
  const localizedBlog = localizeBlog(blog, language);
  const usesStoredGujarati = language === "gu" && Boolean(blog.gujarati);
  const value =
    field === "authorName"
      ? localizedBlog.author.name
      : field === "authorRole"
        ? localizedBlog.author.role
        : localizedBlog[field];

  return (
    <span
      className={usesStoredGujarati ? "notranslate" : undefined}
      translate={usesStoredGujarati ? "no" : undefined}
    >
      {value}
    </span>
  );
}

export function LocalizedBlogBreadcrumb({ blog }: { blog: BlogPost }) {
  const { language, t } = useLanguage();
  const localizedBlog = localizeBlog(blog, language);
  const usesStoredGujarati = language === "gu" && Boolean(blog.gujarati);

  return (
    <div
      className={usesStoredGujarati ? "notranslate" : undefined}
      translate={usesStoredGujarati ? "no" : undefined}
    >
      <Breadcrumb
        items={[
          { label: t("nav.home"), href: "/" },
          { label: t("nav.blogs"), href: "/blogs" },
          { label: localizedBlog.title },
        ]}
      />
    </div>
  );
}

export function LocalizedBlogArticle({ blog }: { blog: BlogPost }) {
  const { language } = useLanguage();
  const localizedBlog = localizeBlog(blog, language);
  const usesStoredGujarati = language === "gu" && Boolean(blog.gujarati);

  return (
    <div
      className={usesStoredGujarati ? "notranslate" : undefined}
      translate={usesStoredGujarati ? "no" : undefined}
      lang={usesStoredGujarati ? "gu" : "en"}
    >
      {localizedBlog.richContent ? (
        <BlogRichText document={localizedBlog.richContent} />
      ) : (
        <div className="space-y-8 text-gray-800">
          {localizedBlog.content.map((section, index) => (
            <div key={index} className="space-y-4">
              {section.heading && (
                <h2 className="title mt-6 text-2xl font-bold text-gray-900">
                  {section.heading}
                </h2>
              )}
              <p className="description text-base leading-relaxed text-gray-700">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
