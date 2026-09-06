const MAX_SLUG_LENGTH = 220;

export function slugifyContentTitle(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/gu, "");
}

export function createUniqueContentSlug(
  value: string,
  usedSlugs: Iterable<string>,
  fallback: string,
): string {
  const used = new Set(usedSlugs);
  const base = slugifyContentTitle(value) || slugifyContentTitle(fallback);
  let candidate = base;
  let suffixNumber = 2;

  while (used.has(candidate)) {
    const suffix = `-${suffixNumber}`;
    const boundedBase = base
      .slice(0, MAX_SLUG_LENGTH - suffix.length)
      .replace(/-+$/gu, "");
    candidate = `${boundedBase}${suffix}`;
    suffixNumber += 1;
  }

  return candidate;
}
