import { createHash } from "node:crypto";
import { resolveFormSections } from "./composition";
import type { SectionDefinition } from "./sections";

export function readStoredSections(value: unknown): SectionDefinition[] {
  if (!Array.isArray(value)) return [];
  return value.every(
    (section) =>
      section &&
      typeof section === "object" &&
      typeof section.key === "string" &&
      typeof section.title === "string" &&
      Array.isArray(section.items),
  )
    ? (value as SectionDefinition[])
    : [];
}

export function buildFormVersionSnapshot(template: {
  name: string;
  slug: string;
  sectionKeys: readonly string[];
}) {
  const sections = resolveFormSections(template.sectionKeys);
  const schemaHash = createHash("sha256")
    .update(
      JSON.stringify({
        name: template.name,
        slug: template.slug,
        compositionKeys: template.sectionKeys,
        sections,
      }),
    )
    .digest("hex");
  return { sections, schemaHash };
}
