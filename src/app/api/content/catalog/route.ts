import { NextResponse } from "next/server";

import { getCategories, getProducts } from "@/lib/contentRepository";

export const dynamic = "force-dynamic";

export async function GET() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  return NextResponse.json(
    { products, categories },
    { headers: { "Cache-Control": "no-store" } },
  );
}
