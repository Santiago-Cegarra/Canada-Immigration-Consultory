export type FormTemplateStatusValue = "DRAFT" | "PUBLISHED";

export type FormTemplateEditorValue = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  /** Orden de bloques y preguntas seleccionadas del banco. */
  sectionKeys: string[];
  status: FormTemplateStatusValue;
};

export type SaveFormTemplateResult =
  { ok: true; id: string } | { ok: false; message: string };
