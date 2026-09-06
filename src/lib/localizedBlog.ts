import type { BlogPost } from "@/types/blog";

export function localizeBlog(blog: BlogPost, language: "en" | "gu"): BlogPost {
  if (language !== "gu" || !blog.gujarati) return blog;

  return {
    ...blog,
    title: blog.gujarati.title,
    category: blog.gujarati.category,
    summary: blog.gujarati.summary,
    author: {
      ...blog.author,
      name: blog.gujarati.author.name,
      role: blog.gujarati.author.role,
      bio: blog.gujarati.author.bio,
    },
    richContent: blog.gujarati.richContent,
    content: blog.gujarati.content,
  };
}
