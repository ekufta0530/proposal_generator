/** Shallow + object-recursive merge. Arrays prefer override. */
export function deepMerge(base: any, override: any) {
  if (override === undefined) return base;
  if (base === undefined) return override;
  if (Array.isArray(base) || Array.isArray(override)) return override;
  const out: any = { ...base };
  for (const [k, v] of Object.entries(override)) {
    out[k] = (v && typeof v === "object" && !Array.isArray(v))
      ? deepMerge(base[k], v)
      : v;
  }
  return out;
}
