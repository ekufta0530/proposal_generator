/** Replace tokens like {{branding.colors.primary}} in any JSON-like object. */
export function interpolateTokens(obj: any, ctx: Record<string, any>) {
  const as = JSON.stringify(obj);
  const rep = as.replace(/{{\s*([\w\.]+)\s*}}/g, (_, path) => {
    const v = path.split(".").reduce((acc, k) => acc?.[k], ctx);
    return (v ?? "").toString();
  });
  return JSON.parse(rep);
}
