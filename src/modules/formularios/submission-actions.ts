"use server";

import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { FORM_SECTION_BY_KEY } from "./sections";
import { readFormAccess } from "./access";
import { findFormTemplateBySlug } from "./templates";
import { sanitizeSubmission } from "./submission-validation";

export type SaveSubmissionResult =
  { ok: true; submissionId: string } | { ok: false; message: string };

export async function saveFormSubmission(
  slug: string,
  answers: Record<string, string>,
): Promise<SaveSubmissionResult> {
  const template = await findFormTemplateBySlug(slug);
  if (!template?.id) {
    return { ok: false, message: "El formulario ya no está disponible." };
  }

  const access = await readFormAccess(template.id, slug);
  if (!access) {
    return {
      ok: false,
      message: "La sesión de acceso venció. Vuelve a introducir tu clave.",
    };
  }

  const sections = template.sectionKeys
    .map((key) => FORM_SECTION_BY_KEY.get(key))
    .filter((section) => section !== undefined);
  const sanitized = sanitizeSubmission(sections, answers);
  if (!sanitized.ok) return sanitized;

  const hasSensitiveData = Object.keys(sanitized.sensitiveData).length > 0;
  const submission = await db.$transaction(async (tx) => {
    const created = await tx.formSubmission.create({
      data: {
        tokenId: access.id,
        personName: sanitized.personName ?? "Persona sin nombre",
        data: sanitized.data as Prisma.InputJsonValue,
        ...(hasSensitiveData
          ? {
              sensitiveData: sanitized.sensitiveData as Prisma.InputJsonValue,
            }
          : {}),
      },
      select: { id: true },
    });
    await tx.formToken.update({
      where: { id: access.id },
      data: { lastUsedAt: new Date() },
    });
    return created;
  });

  return { ok: true, submissionId: submission.id };
}
