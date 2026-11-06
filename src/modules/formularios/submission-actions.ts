"use server";

import { cookies } from "next/headers";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { completedFormCookieName, readFormAccess } from "./access";
import { findFormTemplateBySlug } from "./templates";
import { sanitizeSubmission } from "./submission-validation";
import { readStoredSections } from "./version-snapshot";

export type SaveSubmissionResult =
  { ok: true; submissionId: string } | { ok: false; message: string };

export async function saveFormSubmission(
  slug: string,
  formVersionId: string,
  answers: Record<string, string>,
): Promise<SaveSubmissionResult> {
  const template = await findFormTemplateBySlug(slug);
  if (!template?.id) {
    return { ok: false, message: "El formulario ya no está disponible." };
  }

  if ((await cookies()).has(completedFormCookieName(template.id))) {
    return {
      ok: false,
      message: "Este formulario ya fue enviado desde esta sesión.",
    };
  }

  const access = await readFormAccess(template.id, slug);
  if (!access) {
    return {
      ok: false,
      message: "La sesión de acceso venció. Vuelve a introducir tu clave.",
    };
  }

  if (typeof formVersionId !== "string" || formVersionId.length > 100) {
    return { ok: false, message: "La versión del formulario es inválida." };
  }
  const version = await db.formTemplateVersion.findFirst({
    where: { id: formVersionId, formTemplateId: template.id },
    select: { sections: true },
  });
  const sections = readStoredSections(version?.sections);
  if (!sections.length) {
    return {
      ok: false,
      message: "Actualiza la página antes de enviar el formulario.",
    };
  }
  const sanitized = sanitizeSubmission(sections, answers);
  if (!sanitized.ok) return sanitized;

  const hasSensitiveData = Object.keys(sanitized.sensitiveData).length > 0;
  const submission = await db.$transaction(async (tx) => {
    const refreshedAccess = await tx.formToken.updateMany({
      where: {
        id: access.id,
        formTemplateId: template.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { lastUsedAt: new Date() },
    });
    if (!refreshedAccess.count) return null;

    const created = await tx.formSubmission.create({
      data: {
        tokenId: access.id,
        formTemplateId: template.id,
        formTemplateVersionId: formVersionId,
        personName: sanitized.personName ?? "Persona sin nombre",
        personEmail: sanitized.personEmail,
        responses: sanitized.data as Prisma.InputJsonValue,
        ...(hasSensitiveData
          ? {
              sensitiveResponses:
                sanitized.sensitiveData as Prisma.InputJsonValue,
            }
          : {}),
      },
      select: { id: true },
    });
    return created;
  });

  if (!submission) {
    return { ok: false, message: "La clave de acceso venció o fue revocada." };
  }

  (await cookies()).set(completedFormCookieName(template.id), submission.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: `/formularios/${slug}`,
  });

  return { ok: true, submissionId: submission.id };
}
