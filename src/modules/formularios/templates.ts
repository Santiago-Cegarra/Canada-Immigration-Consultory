import { db } from "@/lib/db";
import { parseCompositionPart } from "./composition";
import type { FormTemplateEditorValue } from "./types";

function toEditorValue(template: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sectionKeys: string[];
  status: "DRAFT" | "PUBLISHED";
}): FormTemplateEditorValue {
  return {
    id: template.id,
    name: template.name,
    slug: template.slug,
    description: template.description ?? "",
    sectionKeys: template.sectionKeys.filter(
      (key) => parseCompositionPart(key) !== null,
    ),
    status: template.status,
  };
}

export async function listFormTemplates() {
  const templates = await db.formTemplate.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return templates.map((template) => ({
    ...toEditorValue(template),
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  }));
}

export async function findFormTemplate(id: string) {
  const template = await db.formTemplate.findUnique({ where: { id } });
  return template ? toEditorValue(template) : null;
}

export async function findFormTemplateBySlug(slug: string) {
  const template = await db.formTemplate.findUnique({ where: { slug } });
  return template ? toEditorValue(template) : null;
}
