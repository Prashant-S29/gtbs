import { validateImageSelection } from "@/lib/imageRules";

interface UploadedImage {
  key: string;
  url: string;
  name: string;
  size: number;
}

export function validateClientImages(files: File[]) {
  for (const file of files) {
    const error = validateImageSelection(file);
    if (error) return `${file.name}: ${error}`;
  }
  return null;
}

export async function uploadAdminImages(
  purpose:
    | "blog-banner"
    | "blog-avatar"
    | "gallery-cover"
    | "gallery-photos"
    | "product-image"
    | "product-detail-images"
    | "team-member-image",
  files: File[],
) {
  const body = new FormData();
  body.set("purpose", purpose);
  files.forEach((file) => body.append("files", file));
  const response = await fetch("/api/admin/content/upload", {
    method: "POST",
    headers: { "X-GTBS-Admin-Request": "1" },
    body,
  });
  const result = (await response.json()) as {
    files?: UploadedImage[];
    message?: string;
  };
  if (!response.ok || !result.files)
    throw new Error(result.message || "Image upload failed.");
  return result.files;
}

export async function adminJsonRequest<T>(
  url: string,
  method: "POST" | "PUT" | "DELETE",
  body?: object,
) {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-GTBS-Admin-Request": "1",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = (await response.json()) as T & { message?: string };
  if (!response.ok) throw new Error(result.message || "Request failed.");
  return result;
}
