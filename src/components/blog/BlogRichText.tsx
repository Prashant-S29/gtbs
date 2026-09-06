import { Fragment, type ReactNode } from "react";

import { isSafeRichTextHref } from "@/lib/blogRichText";
import type {
  BlogRichTextDocument,
  BlogRichTextMark,
  BlogRichTextNode,
} from "@/types/blog";

interface BlogRichTextProps {
  document: BlogRichTextDocument;
}

function renderMarkedText(
  text: string,
  marks: BlogRichTextMark[] = [],
  key: string,
): ReactNode {
  return marks.reduce<ReactNode>((content, mark, index) => {
    const markKey = `${key}-mark-${index}`;
    switch (mark.type) {
      case "bold":
        return <strong key={markKey}>{content}</strong>;
      case "italic":
        return <em key={markKey}>{content}</em>;
      case "underline":
        return <u key={markKey}>{content}</u>;
      case "strike":
        return <s key={markKey}>{content}</s>;
      case "code":
        return (
          <code
            key={markKey}
            className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-800"
          >
            {content}
          </code>
        );
      case "link": {
        const href = mark.attrs?.href;
        if (typeof href !== "string" || !isSafeRichTextHref(href)) {
          return content;
        }
        const external = !href.startsWith("/");
        return (
          <a
            key={markKey}
            href={href}
            className="font-medium text-orange-600 underline decoration-orange-300 underline-offset-2 hover:text-orange-700"
            {...(external
              ? { rel: "noopener noreferrer", target: "_blank" }
              : {})}
          >
            {content}
          </a>
        );
      }
      default:
        return content;
    }
  }, text);
}

function renderNode(node: BlogRichTextNode, key: string): ReactNode {
  const children = node.content?.map((child, index) =>
    renderNode(child, `${key}-${index}`),
  );

  switch (node.type) {
    case "doc":
      return <Fragment key={key}>{children}</Fragment>;
    case "text":
      return renderMarkedText(node.text ?? "", node.marks, key);
    case "paragraph":
      return (
        <p key={key} className="description text-base leading-8 text-gray-700">
          {children}
        </p>
      );
    case "heading":
      return Number(node.attrs?.level) === 3 ? (
        <h3
          key={key}
          className="title pt-2 text-xl font-bold text-gray-900 md:text-2xl"
        >
          {children}
        </h3>
      ) : (
        <h2
          key={key}
          className="title pt-3 text-2xl font-bold text-gray-900 md:text-3xl"
        >
          {children}
        </h2>
      );
    case "bulletList":
      return (
        <ul
          key={key}
          className="description list-disc space-y-2 pl-6 text-base leading-8 text-gray-700 marker:text-orange-500"
        >
          {children}
        </ul>
      );
    case "orderedList": {
      const start = Number(node.attrs?.start);
      return (
        <ol
          key={key}
          start={Number.isInteger(start) && start > 0 ? start : undefined}
          className="description list-decimal space-y-2 pl-6 text-base leading-8 text-gray-700 marker:font-semibold marker:text-orange-600"
        >
          {children}
        </ol>
      );
    }
    case "listItem":
      return (
        <li key={key} className="pl-1 [&>p]:inline">
          {children}
        </li>
      );
    case "blockquote":
      return (
        <blockquote
          key={key}
          className="rounded-r-xl border-l-4 border-orange-400 bg-orange-50/70 px-5 py-3 italic text-gray-700 [&>p]:leading-8"
        >
          {children}
        </blockquote>
      );
    case "codeBlock":
      return (
        <pre
          key={key}
          className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-7 text-slate-100"
        >
          <code>{children}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={key} className="border-slate-200" />;
    case "hardBreak":
      return <br key={key} />;
    default:
      return <Fragment key={key}>{children}</Fragment>;
  }
}

export default function BlogRichText({ document }: BlogRichTextProps) {
  return (
    <div className="space-y-5 text-gray-800">
      {document.content.map((node, index) => renderNode(node, String(index)))}
    </div>
  );
}
