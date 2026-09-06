export class JsonBodyError extends Error {
  readonly status: 400 | 413;

  constructor(message: string, status: 400 | 413) {
    super(message);
    this.status = status;
  }
}

export async function readBoundedJson(
  request: Request,
  maximumBytes = 128 * 1024,
) {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > maximumBytes)
    throw new JsonBodyError("Request body is too large.", 413);
  const text = await request.text();
  if (Buffer.byteLength(text) > maximumBytes) {
    throw new JsonBodyError("Request body is too large.", 413);
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new JsonBodyError("Invalid JSON body.", 400);
  }
}
