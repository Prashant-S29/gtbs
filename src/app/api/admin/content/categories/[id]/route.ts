import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifyAdminApiRequest } from "@/lib/adminApiAuth";
import { JsonBodyError, readBoundedJson } from "@/lib/boundedJson";
import { deleteCategory, updateCategory } from "@/lib/contentRepository";
import { revalidateStorefront } from "@/lib/storefrontRevalidation";
import {
  categoryDraftSchema,
  MAX_CATALOG_DRAFT_BODY_BYTES,
} from "@/lib/contentValidation";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function response(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  if (!(await verifyAdminApiRequest(request)))
    return response({ message: "Unauthorized." }, 401);
  try {
    const body = await readBoundedJson(request, MAX_CATALOG_DRAFT_BODY_BYTES);
    const parsed = categoryDraftSchema.safeParse(body);
    if (!parsed.success)
      return response({ message: "Category fields are invalid." }, 400);
    const { id } = await params;
    const item = await updateCategory(id, parsed.data);
    if (!item) return response({ message: "Category not found." }, 404);
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
            : "Category could not be updated.",
      },
      409,
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  if (!(await verifyAdminApiRequest(request)))
    return response({ message: "Unauthorized." }, 401);
  try {
    const { id } = await params;
    const deleted = await deleteCategory(id);
    if (!deleted) return response({ message: "Category not found." }, 404);
    revalidateStorefront();
    return response({ success: true });
  } catch (error) {
    return response(
      {
        message:
          error instanceof Error
            ? error.message
            : "Category could not be deleted.",
      },
      409,
    );
  }
}
