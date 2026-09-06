import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifyAdminApiRequest } from "@/lib/adminApiAuth";
import {
  deleteGallery,
  getGallery,
  updateGallery,
} from "@/lib/contentRepository";
import { galleryDraftSchema } from "@/lib/contentValidation";
import { deleteUploadedImages } from "@/lib/imageUpload";
import type { GalleryItem } from "@/types/gallery";
import { JsonBodyError, readBoundedJson } from "@/lib/boundedJson";
import { revalidateStorefront } from "@/lib/storefrontRevalidation";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function response(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function managedKeys(item: GalleryItem | null | undefined) {
  if (!item) return [];
  return [item.coverImageKey, ...item.photos.map((photo) => photo.key)].filter(
    (key): key is string => Boolean(key),
  );
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  if (!(await verifyAdminApiRequest(request)))
    return response({ message: "Unauthorized." }, 401);
  let body: unknown;
  try {
    body = await readBoundedJson(request);
  } catch (error) {
    return response(
      {
        message:
          error instanceof JsonBodyError ? error.message : "Invalid JSON body.",
      },
      error instanceof JsonBodyError ? error.status : 400,
    );
  }
  const parsed = galleryDraftSchema.safeParse(body);
  if (!parsed.success)
    return response({ message: "Gallery fields are invalid." }, 400);
  const { id } = await params;
  const previous = await getGallery(id);
  if (!previous) return response({ message: "Gallery not found." }, 404);
  try {
    const item = await updateGallery(id, parsed.data);
    const retainedKeys = new Set(managedKeys(item));
    await deleteUploadedImages(
      managedKeys(previous).filter((key) => !retainedKeys.has(key)),
    );
    revalidateStorefront();
    return response({ item });
  } catch (error) {
    return response(
      {
        message:
          error instanceof Error
            ? error.message
            : "Gallery could not be updated.",
      },
      409,
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  if (!(await verifyAdminApiRequest(request)))
    return response({ message: "Unauthorized." }, 401);
  const { id } = await params;
  const deleted = await deleteGallery(id);
  if (!deleted) return response({ message: "Gallery not found." }, 404);
  await deleteUploadedImages(managedKeys(deleted));
  revalidateStorefront();
  return response({ success: true });
}
