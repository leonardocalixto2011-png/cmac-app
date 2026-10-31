export type DescriptionSection = { title: string; html: string };

/**
 * Splits a product description at its <h3> headings: the opening text, then one
 * section per heading. A description written in /admin with no heading stays whole.
 */
export function splitDescription(html: string): { intro: string; sections: DescriptionSection[] } {
  const parts = html.split(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
  const sections: DescriptionSection[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    sections.push({ title: parts[i].replace(/<[^>]+>/g, "").trim(), html: parts[i + 1].trim() });
  }
  return { intro: parts[0].trim(), sections };
}
