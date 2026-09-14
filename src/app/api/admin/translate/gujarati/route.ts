import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { verifyAdminApiRequest } from "@/lib/adminApiAuth";
import { consumeAdminTranslationLimit } from "@/lib/adminTranslationRateLimit";
import {
  AzureTranslatorConfigurationError,
  gujaratiSuggestionModes,
  isAzureTranslatorConfigured,
  suggestGujarati,
} from "@/lib/azureTranslator";
import { JsonBodyError, readBoundedJson } from "@/lib/boundedJson";

const MAX_REQUEST_BYTES = 42_000;
const MAX_TOTAL_CHARACTERS = 20_000;
const requestSchema = z
  .object({
    mode: z.enum(gujaratiSuggestionModes),
    texts: z.array(z.string().trim().min(1).max(20_000)).min(1).max(25),
  })
  .strict()
  .superRefine(({ mode, texts }, context) => {
    const totalCharacters = texts.reduce(
      (total, text) => total + text.length,
      0,
    );
    if (totalCharacters > MAX_TOTAL_CHARACTERS) {
      context.addIssue({
        code: "custom",
        message: "Suggestion content is too long.",
      });
    }
    if (
      mode === "transliterate" &&
      (texts.length > 10 || totalCharacters > 5_000)
    ) {
      context.addIssue({
        code: "custom",
        message: "Phonetic Gujarati content is too long.",
      });
    }
  });

function response(
  body: object,
  status: number,
  headers: Record<string, string> = {},
) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

export async function POST(request: NextRequest) {
  const adminSession = await verifyAdminApiRequest(request);
  if (!adminSession) return response({ message: "Unauthorized." }, 401);

  let body: unknown;
  try {
    body = await readBoundedJson(request, MAX_REQUEST_BYTES);
  } catch (error) {
    if (error instanceof JsonBodyError) {
      return response({ message: error.message }, error.status);
    }
    return response({ message: "Invalid JSON body." }, 400);
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return response({ message: "Enter valid suggestion content." }, 400);
  }

  if (!isAzureTranslatorConfigured()) {
    return response(
      { message: "Gujarati suggestions are not configured yet." },
      503,
    );
  }

  try {
    const limit = await consumeAdminTranslationLimit(
      adminSession.user.id,
      parsed.data.texts.reduce((total, text) => total + text.length, 0),
    );
    if (!limit.allowed) {
      return response(
        { message: "Too many translation requests. Please try again later." },
        429,
        { "Retry-After": String(limit.retryAfterSeconds) },
      );
    }

    const suggestions = await suggestGujarati(
      parsed.data.texts,
      parsed.data.mode,
    );
    return response({ suggestions }, 200);
  } catch (error) {
    if (error instanceof AzureTranslatorConfigurationError) {
      return response(
        { message: "Gujarati suggestions are not configured yet." },
        503,
      );
    }
    console.error("Gujarati suggestion provider request failed.");
    return response(
      {
        message:
          "Gujarati suggestions are temporarily unavailable. Enter Gujarati manually or try again.",
      },
      502,
    );
  }
}
