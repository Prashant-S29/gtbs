import type { NextRequest } from "next/server";

import { getAdminSession } from "@/lib/adminAuth";
import { isTrustedAdminMutation } from "@/lib/adminRequestSecurity";

export async function verifyAdminApiRequest(request: NextRequest) {
  if (!isTrustedAdminMutation(request)) return null;
  return getAdminSession(request.headers);
}
