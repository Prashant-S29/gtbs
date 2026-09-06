import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifyAdminApiRequest } from "@/lib/adminApiAuth";
import { JsonBodyError, readBoundedJson } from "@/lib/boundedJson";
import { deleteTestimonial, updateTestimonial } from "@/lib/contentRepository";
import { testimonialDraftSchema } from "@/lib/contentValidation";
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

export async function PUT(request: NextRequest, { params }: RouteContext) {
  if (!(await verifyAdminApiRequest(request))) {
    return response({ message: "Unauthorized." }, 401);
  }

  try {
    const body = await readBoundedJson(request);
    const parsed = testimonialDraftSchema.safeParse(body);
    if (!parsed.success) {
      return response({ message: "Testimonial fields are invalid." }, 400);
    }
    const { id } = await params;
    const item = await updateTestimonial(id, parsed.data);
    if (!item) return response({ message: "Testimonial not found." }, 404);
    revalidateStorefront();
    return response({ item });
  } catch (error) {
    if (error instanceof JsonBodyError) {
      return response({ message: error.message }, error.status);
    }
    return response(
      {
        message:
          error instanceof Error
            ? error.message
            : "Testimonial could not be updated.",
      },
      409,
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  if (!(await verifyAdminApiRequest(request))) {
    return response({ message: "Unauthorized." }, 401);
  }
  const { id } = await params;
  const deleted = await deleteTestimonial(id);
  if (!deleted) return response({ message: "Testimonial not found." }, 404);
  revalidateStorefront();
  return response({ success: true });
}
