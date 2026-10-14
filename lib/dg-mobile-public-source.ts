export type DgMobilePublicScript = { url: string; type: string };
export type DgMobilePublicSourceManifest = {
  version: 1;
  status: "ready" | "unavailable";
  scripts: DgMobilePublicScript[];
};

type ScriptLike = { src?: unknown; type?: unknown };
type DocumentLike = {
  location?: { href?: unknown };
  baseURI?: unknown;
  scripts?: ArrayLike<ScriptLike>;
};

/**
 * Exports references to *already loaded* external scripts only.  It never
 * fetches URLs, reads inline bootstrap text, or includes a page URL/query that
 * might contain an account token.  This gives the next investigation a bounded
 * public-source handoff without touching a game or login endpoint.
 */
export function exportDgMobileLoadedPublicScripts(documentLike: unknown): DgMobilePublicSourceManifest {
  const doc = documentLike as DocumentLike | null;
  const base = typeof doc?.baseURI === "string" ? doc.baseURI : doc?.location?.href;
  if (typeof base !== "string" || !base) return { version: 1, status: "unavailable", scripts: [] };
  let baseUrl: URL;
  try { baseUrl = new URL(base); } catch { return { version: 1, status: "unavailable", scripts: [] }; }
  const scripts: DgMobilePublicScript[] = [];
  const seen = new Set<string>();
  for (const script of Array.from(doc?.scripts ?? [])) {
    const raw = typeof script?.src === "string" ? script.src.trim() : "";
    if (!raw) continue; // Never export inline text: it can embed a launch token.
    let source: URL;
    try { source = new URL(raw, baseUrl); } catch { continue; }
    if (source.protocol !== "https:" && source.protocol !== "http:") continue;
    // URL.origin and pathname intentionally omit username/password/query/hash.
    const url = source.origin + source.pathname;
    if (seen.has(url)) continue;
    seen.add(url);
    scripts.push({ url, type: typeof script.type === "string" ? script.type : "" });
  }
  return { version: 1, status: "ready", scripts };
}
