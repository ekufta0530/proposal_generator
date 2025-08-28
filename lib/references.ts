/** Expand reference collections into concrete items. */
export function resolveReferences(refCfg: any, catalog: any) {
  if (!refCfg) return [];
  const set = new Set<string>();
  if (refCfg.useCollection && catalog.collections?.[refCfg.useCollection]) {
    for (const id of catalog.collections[refCfg.useCollection]) set.add(id);
  }
  for (const id of (refCfg.include || [])) set.add(id);
  for (const id of (refCfg.exclude || [])) set.delete(id);
  return (catalog.references || []).filter((r: any) => set.has(r.id));
}
