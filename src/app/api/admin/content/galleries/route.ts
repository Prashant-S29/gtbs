import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifyAdminApiRequest } from "@/lib/adminApiAuth";
import { createGallery } from "@/lib/contentRepository";
import { galleryDraftSchema } from "@/lib/contentValidation";
import { JsonBodyError, readBoundedJson } from "@/lib/boundedJson";
import { revalidateStorefront } from "@/lib/storefrontRevalidation";

function response(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
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
  try {
    const item = await createGallery(parsed.data);
    revalidateStorefront();
    return response({ item }, 201);
  } catch (error) {
    return response(
      {
        message:
          error instanceof Error
            ? error.message
            : "Gallery could not be created.",
      },
      409,
    );
  }
}
