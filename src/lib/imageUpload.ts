import { UTApi } from "uploadthing/server";

import { validateImageSelection } from "@/lib/imageRules";

function hasImageSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }
  if (mimeType === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }
  return false;
}

export async function validateImageFile(file: File) {
  const selectionError = validateImageSelection(file);
  if (selectionError) return selectionError;
  const signature = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!hasImageSignature(signature, file.type))
    return "The uploaded file is not a valid image.";
  return null;
}

export async function uploadImages(files: File[]) {
  const token = process.env.UPLOADTHING_TOKEN?.trim();
  if (!token) throw new Error("UploadThing is not configured on the server.");
  const results = await new UTApi({ token }).uploadFiles(files, {
    concurrency: 4,
  });
  const failed = results.find((result) => result.error);
  if (failed?.error) {
    await deleteUploadedImages(results.map((result) => result.data?.key));
    throw new Error("UploadThing rejected an image upload.");
  }
  return results.map((result) => {
    if (!result.data)
      throw new Error("UploadThing returned an incomplete upload result.");
    return {
      key: result.data.key,
      url: result.data.ufsUrl,
      name: result.data.name,
      size: result.data.size,
    };
  });
}

export async function deleteUploadedImages(keys: Array<string | undefined>) {
  const fileKeys = [
    ...new Set(keys.filter((key): key is string => Boolean(key))),
  ];
  const token = process.env.UPLOADTHING_TOKEN?.trim();
  if (!token || fileKeys.length === 0) return;
  try {
    await new UTApi({ token }).deleteFiles(fileKeys);
  } catch {
    // Content deletion remains authoritative; provider cleanup can be retried separately.
  }
}
