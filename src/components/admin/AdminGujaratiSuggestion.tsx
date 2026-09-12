"use client";

import { Languages, LoaderCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { adminJsonRequest } from "@/lib/adminContentClient";
import type { GujaratiSuggestionMode } from "@/lib/azureTranslator";

const suggestionCache = new Map<string, string>();
const MAX_CACHED_SUGGESTIONS = 200;

interface AdminGujaratiSuggestionProps {
  active: boolean;
  sourceName?: string;
  sourceText?: string;
  targetName?: string;
  targetText?: string;
  onApply?: (suggestion: string) => void;
  autoSuggest?: boolean;
}

function namedFieldValue(component: HTMLElement, name?: string) {
  if (!name) return "";
  const field = component.closest("form")?.elements.namedItem(name);
  return field instanceof HTMLInputElement ||
    field instanceof HTMLTextAreaElement
    ? field.value.trim()
    : "";
}

function updateNamedField(component: HTMLElement, name: string, value: string) {
  const field = component.closest("form")?.elements.namedItem(name);
  if (!(
    field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement
  )) {
    return false;
  }
  const prototype =
    field instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  setter?.call(field, value);
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
  field.focus();
  return true;
}

export default function AdminGujaratiSuggestion({
  active,
  sourceName,
  sourceText,
  targetName,
  targetText,
  onApply,
  autoSuggest = true,
}: AdminGujaratiSuggestionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef(0);
  const [mode, setMode] = useState<GujaratiSuggestionMode>("translate");
  const [phoneticText, setPhoneticText] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const sourceForMode = useCallback(() => {
    if (mode === "transliterate") return phoneticText.trim();
    return (
      sourceText?.trim() ||
      namedFieldValue(rootRef.current as HTMLElement, sourceName)
    );
  }, [mode, phoneticText, sourceName, sourceText]);

  const generate = useCallback(async () => {
    const source = sourceForMode();
    if (!source) {
      setSuggestion("");
      setError(
        mode === "translate"
          ? "Enter the corresponding English content first."
          : "Type the Gujarati pronunciation in English letters first.",
      );
      return;
    }

    const cacheKey = `${mode}:${source}`;
    const cachedSuggestion = suggestionCache.get(cacheKey);
    if (cachedSuggestion) {
      setSuggestion(cachedSuggestion);
      setError("");
      return;
    }

    const requestId = ++requestRef.current;
    setBusy(true);
    setError("");
    try {
      const result = await adminJsonRequest<{ suggestions: string[] }>(
        "/api/admin/translate/gujarati",
        "POST",
        { mode, texts: [source] },
      );
      if (requestId !== requestRef.current) return;
      const nextSuggestion = result.suggestions[0]?.trim();
      if (!nextSuggestion)
        throw new Error("No Gujarati suggestion was returned.");
      if (suggestionCache.size >= MAX_CACHED_SUGGESTIONS) {
        suggestionCache.delete(suggestionCache.keys().next().value ?? "");
      }
      suggestionCache.set(cacheKey, nextSuggestion);
      setSuggestion(nextSuggestion);
    } catch (requestError) {
      if (requestId !== requestRef.current) return;
      setSuggestion("");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Gujarati suggestion could not be generated.",
      );
    } finally {
      if (requestId === requestRef.current) setBusy(false);
    }
  }, [mode, sourceForMode]);

  useEffect(() => {
    if (!active || !autoSuggest || mode !== "translate") return;
    const existingTarget =
      targetText?.trim() ||
      (rootRef.current ? namedFieldValue(rootRef.current, targetName) : "");
    if (existingTarget) return;
    const timer = window.setTimeout(() => void generate(), 450);
    return () => window.clearTimeout(timer);
  }, [active, autoSuggest, generate, mode, targetName, targetText]);

  if (!active) return null;

  const applySuggestion = () => {
    if (!suggestion) return;
    if (onApply) {
      onApply(suggestion);
      return;
    }
    if (!rootRef.current || !targetName) return;
    updateNamedField(rootRef.current, targetName, suggestion);
  };

  return (
    <div
      ref={rootRef}
      className="mt-2 rounded-xl border border-orange-200 bg-white p-3 text-left"
      lang="en"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            aria-pressed={mode === "translate"}
            onClick={() => {
              setMode("translate");
              setSuggestion("");
              setError("");
            }}
            className={`rounded-md px-2.5 py-1.5 ${
              mode === "translate"
                ? "bg-white text-orange-700 shadow-sm"
                : "text-slate-600"
            }`}
          >
            Translate English
          </button>
          <button
            type="button"
            aria-pressed={mode === "transliterate"}
            onClick={() => {
              setMode("transliterate");
              setSuggestion("");
              setError("");
            }}
            className={`rounded-md px-2.5 py-1.5 ${
              mode === "transliterate"
                ? "bg-white text-orange-700 shadow-sm"
                : "text-slate-600"
            }`}
          >
            Type phonetically
          </button>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void generate()}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-orange-200 px-3 text-xs font-semibold text-orange-700 hover:bg-orange-50 disabled:opacity-60"
        >
          {busy ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          {busy ? "Generating..." : "Generate"}
        </button>
      </div>

      {mode === "transliterate" ? (
        <label className="mt-3 block text-xs font-semibold text-slate-700">
          Gujarati pronunciation in English letters
          <input
            value={phoneticText}
            onChange={(event) => setPhoneticText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void generate();
              }
            }}
            maxLength={5_000}
            placeholder="For example: kem cho"
            className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </label>
      ) : (
        <p className="mt-2 text-xs text-slate-500">
          Suggested automatically from the corresponding English field.
        </p>
      )}

      {error ? (
        <p role="status" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      ) : null}
      {suggestion ? (
        <div className="mt-3 rounded-lg bg-orange-50 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-orange-800">
            <Languages size={14} /> Gujarati suggestion — please review
          </p>
          <p className="mt-1.5 text-base leading-7 text-slate-900" lang="gu">
            {suggestion}
          </p>
          <button
            type="button"
            onClick={applySuggestion}
            className="mt-2 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700"
          >
            Use suggestion
          </button>
        </div>
      ) : null}
    </div>
  );
}
