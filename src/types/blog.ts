interface BlogComment {
  id: string;
  name: string;
  avatar?: string;
  date: string;
  content: string;
}

interface BlogContentSection {
  heading?: string;
  body: string;
  subsections?: {
    subheading: string;
    body: string;
  }[];
  quote?: {
    text: string;
    author: string;
  };
  keyTakeaways?: string[];
}

export interface BlogRichTextMark {
  type: "bold" | "italic" | "underline" | "strike" | "code" | "link";
  attrs?: Record<string, boolean | number | string | null>;
}

export interface BlogRichTextNode {
  type:
    | "doc"
    | "paragraph"
    | "heading"
    | "bulletList"
    | "orderedList"
    | "listItem"
    | "blockquote"
    | "codeBlock"
    | "horizontalRule"
    | "hardBreak"
    | "text";
  attrs?: Record<string, boolean | number | string | null>;
  content?: BlogRichTextNode[];
  marks?: BlogRichTextMark[];
  text?: string;
}

export interface BlogRichTextDocument extends BlogRichTextNode {
  type: "doc";
  content: BlogRichTextNode[];
}

interface BlogLocalizedContent {
  title: string;
  category: string;
  summary: string;
  author: {
    name: string;
    role: string;
    bio?: string;
  };
  richContent?: BlogRichTextDocument;
  content: BlogContentSection[];
}

export interface BlogPost {
  id: string | number;
  title: string;
  slug: string;
  category: string;
  date: string;
  image: string;
  imageKey?: string;
  summary: string;
  author: {
    name: string;
    role: string;
    avatar: string;
    bio?: string;
  };
  tags?: string[];
  richContent?: BlogRichTextDocument;
  content: BlogContentSection[];
  gujarati?: BlogLocalizedContent;
  comments?: BlogComment[];
}
