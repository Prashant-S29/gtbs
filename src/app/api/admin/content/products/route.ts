import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifyAdminApiRequest } from "@/lib/adminApiAuth";
import { JsonBodyError, readBoundedJson } from "@/lib/boundedJson";
import { createProduct } from "@/lib/contentRepository";
import { revalidateStorefront } from "@/lib/storefrontRevalidation";
import {
  MAX_CATALOG_DRAFT_BODY_BYTES,
  productDraftSchema,
} from "@/lib/contentValidation";

function response(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdminApiRequest(request)))
    return response({ message: "Unauthorized." }, 401);
  try {
    const body = await readBoundedJson(request, MAX_CATALOG_DRAFT_BODY_BYTES);
    const parsed = productDraftSchema.safeParse(body);
    if (!parsed.success)
      return response({ message: "Product fields are invalid." }, 400);
    const item = await createProduct(parsed.data);
    revalidateStorefront();
    return response({ item }, 201);
  } catch (error) {
    if (error instanceof JsonBodyError)
      return response({ message: error.message }, error.status);
    return response(
      {
        message:
          error instanceof Error
            ? error.message
            : "Product could not be created.",
      },
      409,
    );
  }
}
