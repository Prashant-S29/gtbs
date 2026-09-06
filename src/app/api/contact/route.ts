import { NextResponse } from "next/server";
import { z } from "zod";

import { sendContactMessage } from "@/lib/email";
import {
  consumePublicEmailLimit,
  isTrustedPublicEmailRequest,
} from "@/lib/publicEmailSecurity";

const MAX_REQUEST_BYTES = 4_096;
const contactSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    phone: z.string().regex(/^\d{10}$/u),
    email: z.string().trim().email().max(254),
    message: z.string().trim().min(1).max(2_000),
    website: z.string().max(0).optional().default(""),
  })
  .strict();

function response(body: object, status: number, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

export async function POST(request: Request) {
  if (!isTrustedPublicEmailRequest(request)) {
    return response({ message: "Request could not be verified." }, 403);
  }
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_REQUEST_BYTES) {
    return response({ message: "Message is too large." }, 413);
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (Buffer.byteLength(text) > MAX_REQUEST_BYTES) {
      return response({ message: "Message is too large." }, 413);
    }
    body = JSON.parse(text);
  } catch {
    return response({ message: "Enter valid contact details." }, 400);
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return response({ message: "Enter valid contact details." }, 400);
  }
  if (parsed.data.website) return response({ success: true }, 200);

  let limit: Awaited<ReturnType<typeof consumePublicEmailLimit>>;
  try {
    limit = await consumePublicEmailLimit(request, "contact");
  } catch {
    console.error("Contact email throttling is unavailable.");
    return response(
      { message: "Online messaging is temporarily unavailable." },
      503,
    );
  }
  if (!limit.allowed) {
    return response(
      { message: "Too many messages. Please wait before trying again." },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  try {
    await sendContactMessage(parsed.data);
    return response({ success: true }, 200);
  } catch {
    console.error("Contact email delivery failed.");
    return response(
      { message: "Online messaging is temporarily unavailable." },
      503,
    );
  }
}
