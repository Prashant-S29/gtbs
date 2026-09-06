import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifyAdminApiRequest } from "@/lib/adminApiAuth";
import { JsonBodyError, readBoundedJson } from "@/lib/boundedJson";
import {
  deleteTeamMember,
  getTeamMember,
  updateTeamMember,
} from "@/lib/contentRepository";
import { teamMemberDraftSchema } from "@/lib/contentValidation";
import { deleteUploadedImages } from "@/lib/imageUpload";
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
    const parsed = teamMemberDraftSchema.safeParse(body);
    if (!parsed.success) {
      return response({ message: "Team member fields are invalid." }, 400);
    }

    const { id } = await params;
    const previous = await getTeamMember(id);
    if (!previous) return response({ message: "Team member not found." }, 404);
    const item = await updateTeamMember(id, parsed.data);
    if (!item) return response({ message: "Team member not found." }, 404);
    if (previous.imageKey && previous.imageKey !== item.imageKey) {
      await deleteUploadedImages([previous.imageKey]);
    }
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
            : "Team member could not be updated.",
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
  const deleted = await deleteTeamMember(id);
  if (!deleted) return response({ message: "Team member not found." }, 404);
  await deleteUploadedImages([deleted.imageKey]);
  revalidateStorefront();
  return response({ success: true });
}
