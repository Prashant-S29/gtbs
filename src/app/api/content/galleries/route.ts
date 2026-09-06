import { NextResponse } from "next/server";

import { getGalleries } from "@/lib/contentRepository";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { items: await getGalleries() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
