export function cleanText(raw: string): string {
  return raw
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function chunkText(text: string, size = 1200, overlap = 150): string[] {
  const clean = cleanText(text);
  if (clean.length <= size) return [clean];
  const chunks: string[] = [];
  let i = 0;
  while (i < clean.length) {
    let end = Math.min(i + size, clean.length);
    if (end < clean.length) {
      const slice = clean.slice(i, end);
      const lastPara = slice.lastIndexOf("\n\n");
      const lastSent = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("? "), slice.lastIndexOf("! "));
      const cut = lastPara > size * 0.5 ? lastPara + 2 : lastSent > size * 0.5 ? lastSent + 2 : slice.length;
      end = i + cut;
    }
    chunks.push(clean.slice(i, end).trim());
    if (end >= clean.length) break;
    i = end - overlap;
  }
  return chunks.filter((c) => c.length > 20);
}
