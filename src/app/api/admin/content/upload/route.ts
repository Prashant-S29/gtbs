import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifyAdminApiRequest } from "@/lib/adminApiAuth";
import { uploadImages, validateImageFile } from "@/lib/imageUpload";
import {
  MAX_GALLERY_PHOTOS,
  MAX_IMAGE_BYTES,
  MAX_PRODUCT_DETAIL_IMAGES,
} from "@/lib/imageRules";

const MAX_REQUEST_BYTES =
  (MAX_GALLERY_PHOTOS + 1) * MAX_IMAGE_BYTES + 256 * 1024;
const allowedPurposes = new Set([
  "blog-banner",
  "blog-avatar",
  "gallery-cover",
  "gallery-photos",
  "product-image",
  "product-detail-images",
  "team-member-image",
]);

function response(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdminApiRequest(request)))
    return response({ message: "Unauthorized." }, 401);
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_REQUEST_BYTES)
    return response({ message: "Upload is too large." }, 413);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return response({ message: "Invalid upload body." }, 400);
  }

  const purpose = String(formData.get("purpose") || "");
  if (!allowedPurposes.has(purpose))
    return response({ message: "Invalid upload purpose." }, 400);
  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File);
  const maximumFiles =
    purpose === "gallery-photos"
      ? MAX_GALLERY_PHOTOS
      : purpose === "product-detail-images"
        ? MAX_PRODUCT_DETAIL_IMAGES
        : 1;
  if (files.length < 1 || files.length > maximumFiles) {
    return response(
      { message: `Upload between 1 and ${maximumFiles} image(s).` },
      400,
    );
  }
  for (const file of files) {
    const validationError = await validateImageFile(file);
    if (validationError) return response({ message: validationError }, 400);
  }

  try {
    return response({ files: await uploadImages(files) }, 201);
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("not configured")
        ? error.message
        : "Images could not be uploaded.";
    return response(
      { message },
      message.includes("not configured") ? 503 : 502,
    );
  }
}
