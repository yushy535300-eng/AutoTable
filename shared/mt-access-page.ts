/** Exact denial-document evidence, not an interpretation of a user's IP or account. */
export function isMtRestrictedHtml(source: string): boolean {
  const title = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(source)?.[1] || '';
  const visible = source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ');
  const label = /Unauthorized access|訪問受限|訪問受限制|access restrict/i.test(visible);
  const restrictionCopy = /service is restricted|location from which you are accessing|服務允許範圍|所在地不在/i.test(visible);
  return label && (restrictionCopy || /access restrict|unauthorized/i.test(title));
}
