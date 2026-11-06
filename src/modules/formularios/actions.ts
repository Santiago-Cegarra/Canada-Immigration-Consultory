"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/modules/auth/guards";
import { isValidComposition } from "./composition";
import type { FormTemplateEditorValue, SaveFormTemplateResult } from "./types";

const templateSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().min(3).max(100),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(500),
  sectionKeys: z.array(z.string().max(4096)).refine(isValidComposition),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

/** Guarda la composición de bloques; las preguntas nunca llegan del cliente. */
export async function saveFormTemplate(
  input: FormTemplateEditorValue,
): Promise<SaveFormTemplateResult> {
  await requireAdmin();

  const parsed = templateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message:
        "Revisa el nombre, la URL y agrega al menos una sección antes de guardar.",
    };
  }

  const { id, description, ...data } = parsed.data;

  try {
    const template = id
      ? await db.formTemplate.update({
          where: { id },
          data: { ...data, description: description || null },
          select: { id: true },
        })
      : await db.formTemplate.create({
          data: { ...data, description: description || null },
          select: { id: true },
        });

    revalidatePath("/admin");
    revalidatePath("/admin/formularios");
    revalidatePath(`/admin/formularios/${template.id}`);
    return { ok: true, id: template.id };
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return {
        ok: false,
        message: "Ya existe un formulario con esa URL. Elige otra.",
      };
    }

    return {
      ok: false,
      message: "No se pudo guardar el formulario. Inténtalo de nuevo.",
    };
  }
}
