"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  redirectToallproducts?: boolean;
  className?: string;
  inputClassName?: string;
  size?: "sm" | "md" | "lg";
}

export default function SearchBar({
  value: controlledValue,
  placeholder = "Search books...",
  onChange,
  onSearch,
  debounceMs = 300,
  redirectToallproducts = false,
  className = "",
  inputClassName = "",
  size = "md",
}: SearchBarProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [query, setQuery] = useState(controlledValue || "");
  const isFirstMount = useRef(true);

  // Sync when controlled value changes from outside
  useEffect(() => {
    if (controlledValue === undefined) return;

    const timer = window.setTimeout(() => setQuery(controlledValue), 0);
    return () => window.clearTimeout(timer);
  }, [controlledValue]);

  // Debounced search on input change
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      if (onChange) {
        onChange(query);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, onChange]);

  const executeSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (onSearch) {
      onSearch(trimmed);
    }
    if (redirectToallproducts) {
      if (trimmed) {
        router.push(`/allproducts?search=${encodeURIComponent(trimmed)}`);
      } else {
        router.push("/allproducts");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    if (onChange) onChange("");
    if (onSearch) onSearch("");
    if (redirectToallproducts) router.push("/allproducts");
  };

  const heightClasses =
    size === "sm"
      ? "h-10 text-xs"
      : size === "lg"
        ? "h-12 text-sm"
        : "h-11 text-sm";

  const btnSize =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-10 w-10" : "h-9 w-9";
  const iconSize = size === "sm" ? 16 : 18;

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`relative w-full overflow-hidden rounded-full border border-gray-300 bg-white transition-all duration-200 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 ${className}`}
    >
      <input
        type="text"
        name="search"
        autoComplete="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`block w-full appearance-none border-0 bg-transparent py-2 pl-5 pr-14 text-gray-800 outline-none placeholder:text-gray-400 description tracking-wide focus:border-0 focus:outline-none focus:ring-0 ${heightClasses} ${inputClassName}`}
      />

      {/* Clear Button */}
      {query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label={t("search.clear")}
          className="absolute right-11 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={14} />
        </button>
      )}

      {/* Search Submit Button */}
      <button
        type="submit"
        aria-label={t("search.submit")}
        className={`absolute right-1 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full text-gray-500 transition-all duration-200 hover:bg-orange-500 hover:text-white active:scale-95 cursor-pointer ${btnSize}`}
      >
        <Search size={iconSize} />
      </button>
    </form>
  );
}
