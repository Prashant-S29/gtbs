import type {
  BlogPost,
  BlogRichTextDocument,
  BlogRichTextNode,
} from "@/types/blog";

export const MAX_BLOG_CONTENT_CHARACTERS = 40_000;
export const MAX_BLOG_RICH_TEXT_JSON_CHARACTERS = 80_000;

function emptyBlogRichText(): BlogRichTextDocument {
  return { type: "doc", content: [{ type: "paragraph" }] };
}

export function plainTextToBlogRichText(text: string): BlogRichTextDocument {
  const paragraphs = text
    .split(/\n\s*\n/gu)
    .map((body) => body.trim())
    .filter(Boolean);

  return {
    type: "doc",
    content:
      paragraphs.length > 0
        ? paragraphs.map((body) => ({
            type: "paragraph" as const,
            content: [{ type: "text" as const, text: body }],
          }))
        : [{ type: "paragraph" }],
  };
}

function textNode(text: string): BlogRichTextNode {
  return { type: "text", text };
}

export function blogToRichText(blog?: BlogPost): BlogRichTextDocument {
  if (!blog) return emptyBlogRichText();
  if (blog.richContent) return blog.richContent;

  const content: BlogRichTextNode[] = [];
  for (const section of blog.content) {
    if (section.heading) {
      content.push({
        type: "heading",
        attrs: { level: 2 },
        content: [textNode(section.heading)],
      });
    }
    content.push({ type: "paragraph", content: [textNode(section.body)] });

    for (const subsection of section.subsections ?? []) {
      content.push({
        type: "heading",
        attrs: { level: 3 },
        content: [textNode(subsection.subheading)],
      });
      content.push({ type: "paragraph", content: [textNode(subsection.body)] });
    }

    if (section.quote) {
      content.push({
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [
              textNode(`${section.quote.text} — ${section.quote.author}`),
            ],
          },
        ],
      });
    }

    if (section.keyTakeaways?.length) {
      content.push({
        type: "bulletList",
        content: section.keyTakeaways.map((takeaway) => ({
          type: "listItem",
          content: [{ type: "paragraph", content: [textNode(takeaway)] }],
        })),
      });
    }
  }

  return {
    type: "doc",
    content: content.length > 0 ? content : [{ type: "paragraph" }],
  };
}

export function blogToGujaratiRichText(blog?: BlogPost): BlogRichTextDocument {
  if (!blog?.gujarati) return emptyBlogRichText();
  if (blog.gujarati.richContent) return blog.gujarati.richContent;

  return plainTextToBlogRichText(
    blog.gujarati.content.map((section) => section.body).join("\n\n"),
  );
}

export function blogRichTextToPlainText(
  document: BlogRichTextDocument,
): string {
  const blocks: string[] = [];

  const visit = (node: BlogRichTextNode) => {
    if (node.type === "text") {
      const previous = blocks.pop() ?? "";
      blocks.push(`${previous}${node.text ?? ""}`);
      return;
    }
    if (node.type === "hardBreak") {
      const previous = blocks.pop() ?? "";
      blocks.push(`${previous}\n`);
      return;
    }

    const isTextBlock = [
      "paragraph",
      "heading",
      "listItem",
      "blockquote",
      "codeBlock",
    ].includes(node.type);
    if (isTextBlock) blocks.push("");
    node.content?.forEach(visit);
  };

  document.content.forEach(visit);
  return blocks
    .map((block) => block.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function isSafeRichTextHref(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return ["http:", "https:", "mailto:", "tel:"].includes(
      new URL(value).protocol,
    );
  } catch {
    return false;
  }
}
