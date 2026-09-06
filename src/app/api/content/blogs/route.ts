import { NextResponse } from "next/server";

import { getBlogs } from "@/lib/contentRepository";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { items: await getBlogs() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
