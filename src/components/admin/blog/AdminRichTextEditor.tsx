"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code2,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { isSafeRichTextHref } from "@/lib/blogRichText";
import type { BlogRichTextDocument } from "@/types/blog";

interface AdminRichTextEditorProps {
  initialContent: BlogRichTextDocument;
  onChange: (content: BlogRichTextDocument) => void;
  error?: string;
  ariaLabel?: string;
}

interface ToolbarButtonProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-10 min-w-10 items-center justify-center rounded-lg border px-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-orange-300 bg-orange-50 text-orange-700"
          : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

export default function AdminRichTextEditor({
  initialContent,
  onChange,
  error,
  ariaLabel = "Article content",
}: AdminRichTextEditorProps) {
  const onChangeRef = useRef(onChange);
  const [linkError, setLinkError] = useState("");

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          autolink: true,
          defaultProtocol: "https",
          linkOnPaste: true,
          openOnClick: false,
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank",
          },
        },
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        "aria-label": ariaLabel,
        class:
          "min-h-80 px-4 py-3 text-base leading-7 text-slate-800 outline-none sm:min-h-96",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChangeRef.current(currentEditor.getJSON() as BlogRichTextDocument);
    },
  });

  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      bold: currentEditor?.isActive("bold") ?? false,
      italic: currentEditor?.isActive("italic") ?? false,
      underline: currentEditor?.isActive("underline") ?? false,
      strike: currentEditor?.isActive("strike") ?? false,
      heading2: currentEditor?.isActive("heading", { level: 2 }) ?? false,
      heading3: currentEditor?.isActive("heading", { level: 3 }) ?? false,
      bulletList: currentEditor?.isActive("bulletList") ?? false,
      orderedList: currentEditor?.isActive("orderedList") ?? false,
      blockquote: currentEditor?.isActive("blockquote") ?? false,
      codeBlock: currentEditor?.isActive("codeBlock") ?? false,
      link: currentEditor?.isActive("link") ?? false,
      canUndo: currentEditor?.can().chain().focus().undo().run() ?? false,
      canRedo: currentEditor?.can().chain().focus().redo().run() ?? false,
    }),
  });

  const updateLink = () => {
    if (!editor) return;
    const currentHref = String(editor.getAttributes("link").href || "");
    const enteredHref = window.prompt(
      "Enter an HTTPS, email, phone, or local link:",
      currentHref,
    );
    if (enteredHref === null) return;

    const trimmedHref = enteredHref.trim();
    if (!trimmedHref) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkError("");
      return;
    }

    const normalizedHref =
      trimmedHref.startsWith("/") || /^[a-z][a-z\d+.-]*:/iu.test(trimmedHref)
        ? trimmedHref
        : `https://${trimmedHref}`;
    if (!isSafeRichTextHref(normalizedHref)) {
      setLinkError(
        "Use an HTTP(S), mailto, tel, or same-site link beginning with /.",
      );
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: normalizedHref })
      .run();
    setLinkError("");
  };

  const isUnavailable = !editor;

  return (
    <div>
      <div
        className={`overflow-hidden rounded-xl border bg-white ${
          error
            ? "border-red-400"
            : "border-slate-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/10"
        }`}
      >
        <div
          role="toolbar"
          aria-label="Article formatting"
          className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50/80 p-2"
        >
          <ToolbarButton
            label="Bold"
            active={toolbarState?.bold}
            disabled={isUnavailable}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold size={17} />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={toolbarState?.italic}
            disabled={isUnavailable}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic size={17} />
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            active={toolbarState?.underline}
            disabled={isUnavailable}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            <Underline size={17} />
          </ToolbarButton>
          <ToolbarButton
            label="Strikethrough"
            active={toolbarState?.strike}
            disabled={isUnavailable}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
          >
            <Strikethrough size={17} />
          </ToolbarButton>
          <span
            className="mx-1 hidden w-px self-stretch bg-slate-200 sm:block"
            aria-hidden="true"
          />
          <ToolbarButton
            label="Heading 2"
            active={toolbarState?.heading2}
            disabled={isUnavailable}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 size={18} />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 3"
            active={toolbarState?.heading3}
            disabled={isUnavailable}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 size={18} />
          </ToolbarButton>
          <ToolbarButton
            label="Bullet list"
            active={toolbarState?.bulletList}
            disabled={isUnavailable}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List size={18} />
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            active={toolbarState?.orderedList}
            disabled={isUnavailable}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={18} />
          </ToolbarButton>
          <ToolbarButton
            label="Block quote"
            active={toolbarState?.blockquote}
            disabled={isUnavailable}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          >
            <Quote size={18} />
          </ToolbarButton>
          <ToolbarButton
            label="Code block"
            active={toolbarState?.codeBlock}
            disabled={isUnavailable}
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          >
            <Code2 size={18} />
          </ToolbarButton>
          <ToolbarButton
            label="Horizontal rule"
            disabled={isUnavailable}
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          >
            <Minus size={18} />
          </ToolbarButton>
          <span
            className="mx-1 hidden w-px self-stretch bg-slate-200 sm:block"
            aria-hidden="true"
          />
          <ToolbarButton
            label="Add or edit link"
            active={toolbarState?.link}
            disabled={isUnavailable}
            onClick={updateLink}
          >
            <Link2 size={17} />
          </ToolbarButton>
          <ToolbarButton
            label="Remove link"
            disabled={isUnavailable || !toolbarState?.link}
            onClick={() => editor?.chain().focus().unsetLink().run()}
          >
            <Unlink size={17} />
          </ToolbarButton>
          <ToolbarButton
            label="Undo"
            disabled={isUnavailable || !toolbarState?.canUndo}
            onClick={() => editor?.chain().focus().undo().run()}
          >
            <Undo2 size={17} />
          </ToolbarButton>
          <ToolbarButton
            label="Redo"
            disabled={isUnavailable || !toolbarState?.canRedo}
            onClick={() => editor?.chain().focus().redo().run()}
          >
            <Redo2 size={17} />
          </ToolbarButton>
        </div>

        <EditorContent
          editor={editor}
          className="[&_.tiptap_a]:cursor-pointer [&_.tiptap_a]:text-orange-600 [&_.tiptap_a]:underline [&_.tiptap_blockquote]:my-4 [&_.tiptap_blockquote]:border-l-4 [&_.tiptap_blockquote]:border-orange-300 [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:italic [&_.tiptap_code]:rounded [&_.tiptap_code]:bg-slate-100 [&_.tiptap_code]:px-1 [&_.tiptap_code]:py-0.5 [&_.tiptap_h2]:mb-2 [&_.tiptap_h2]:mt-6 [&_.tiptap_h2]:text-2xl [&_.tiptap_h2]:font-bold [&_.tiptap_h3]:mb-2 [&_.tiptap_h3]:mt-5 [&_.tiptap_h3]:text-xl [&_.tiptap_h3]:font-bold [&_.tiptap_hr]:my-6 [&_.tiptap_hr]:border-slate-200 [&_.tiptap_ol]:my-3 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-7 [&_.tiptap_p]:my-3 [&_.tiptap_pre]:my-4 [&_.tiptap_pre]:overflow-x-auto [&_.tiptap_pre]:rounded-lg [&_.tiptap_pre]:bg-slate-900 [&_.tiptap_pre]:p-4 [&_.tiptap_pre]:text-slate-100 [&_.tiptap_ul]:my-3 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-7"
        />
      </div>
      {(error || linkError) && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error || linkError}
        </p>
      )}
    </div>
  );
}
