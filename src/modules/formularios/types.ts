import type { SectionKey } from "./sections";

export type FormTemplateStatusValue = "DRAFT" | "PUBLISHED";

export type FormTemplateEditorValue = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  sectionKeys: SectionKey[];
  status: FormTemplateStatusValue;
};

export type SaveFormTemplateResult =
  { ok: true; id: string } | { ok: false; message: string };
