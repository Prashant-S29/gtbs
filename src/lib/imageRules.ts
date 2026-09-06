export const MAX_IMAGE_BYTES = 500 * 1024;
export const MAX_GALLERY_PHOTOS = 12;
export const MAX_PRODUCT_DETAIL_IMAGES = 6;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function validateImageSelection(file: File) {
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
    )
  ) {
    return "Only JPG, PNG, and WebP images are allowed.";
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    return "Each image must be 500 KB or smaller.";
  }
  return null;
}
