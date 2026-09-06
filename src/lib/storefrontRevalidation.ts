import { revalidatePath } from "next/cache";

/** Invalidate cached public pages after a successful admin content mutation. */
export function revalidateStorefront() {
  revalidatePath("/", "layout");
}
