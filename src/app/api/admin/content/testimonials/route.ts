import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifyAdminApiRequest } from "@/lib/adminApiAuth";
import { JsonBodyError, readBoundedJson } from "@/lib/boundedJson";
import { createTestimonial } from "@/lib/contentRepository";
import { testimonialDraftSchema } from "@/lib/contentValidation";
import { revalidateStorefront } from "@/lib/storefrontRevalidation";

function response(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdminApiRequest(request))) {
    return response({ message: "Unauthorized." }, 401);
  }

  try {
    const body = await readBoundedJson(request);
    const parsed = testimonialDraftSchema.safeParse(body);
    if (!parsed.success) {
      return response({ message: "Testimonial fields are invalid." }, 400);
    }
    const item = await createTestimonial(parsed.data);
    revalidateStorefront();
    return response({ item }, 201);
  } catch (error) {
    if (error instanceof JsonBodyError) {
      return response({ message: error.message }, error.status);
    }
    return response(
      {
        message:
          error instanceof Error
            ? error.message
            : "Testimonial could not be created.",
      },
      409,
    );
  }
}
