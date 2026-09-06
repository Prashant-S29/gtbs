import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifyAdminApiRequest } from "@/lib/adminApiAuth";
import { JsonBodyError, readBoundedJson } from "@/lib/boundedJson";
import {
  deleteProduct,
  getProduct,
  updateProduct,
} from "@/lib/contentRepository";
import {
  MAX_CATALOG_DRAFT_BODY_BYTES,
  productDraftSchema,
} from "@/lib/contentValidation";
import { deleteUploadedImages } from "@/lib/imageUpload";
import type { Product } from "@/types/product";
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

function managedKeys(item: Product | null | undefined) {
  if (!item) return [];
  return [
    item.imageKey,
    ...(item.detailImages || []).map((image) => image.key),
  ].filter((key): key is string => Boolean(key));
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  if (!(await verifyAdminApiRequest(request)))
    return response({ message: "Unauthorized." }, 401);
  try {
    const body = await readBoundedJson(request, MAX_CATALOG_DRAFT_BODY_BYTES);
    const parsed = productDraftSchema.safeParse(body);
    if (!parsed.success)
      return response({ message: "Product fields are invalid." }, 400);
    const { id } = await params;
    const previous = await getProduct(id);
    if (!previous) return response({ message: "Product not found." }, 404);
    const item = await updateProduct(id, parsed.data);
    const retainedKeys = new Set(managedKeys(item));
    await deleteUploadedImages(
      managedKeys(previous).filter((key) => !retainedKeys.has(key)),
    );
    revalidateStorefront();
    return response({ item });
  } catch (error) {
    if (error instanceof JsonBodyError)
      return response({ message: error.message }, error.status);
    return response(
      {
        message:
          error instanceof Error
            ? error.message
            : "Product could not be updated.",
      },
      409,
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  if (!(await verifyAdminApiRequest(request)))
    return response({ message: "Unauthorized." }, 401);
  const { id } = await params;
  const deleted = await deleteProduct(id);
  if (!deleted) return response({ message: "Product not found." }, 404);
  await deleteUploadedImages(managedKeys(deleted));
  revalidateStorefront();
  return response({ success: true });
}
