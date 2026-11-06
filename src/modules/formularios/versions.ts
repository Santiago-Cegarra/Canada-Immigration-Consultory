import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import type { SectionDefinition } from "./sections";
import {
  buildFormVersionSnapshot,
  readStoredSections,
} from "./version-snapshot";

export type FormVersionView = {
  id: string;
  version: number;
  name: string;
  sections: SectionDefinition[];
};

/** Crea una nueva versión solo si cambió el cuestionario realmente presentado. */
export async function ensureFormTemplateVersion(
  formTemplateId: string,
): Promise<FormVersionView | null> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await db.$transaction(
        async (tx) => {
          const template = await tx.formTemplate.findUnique({
            where: { id: formTemplateId },
            select: {
              id: true,
              name: true,
              slug: true,
              sectionKeys: true,
            },
          });
          if (!template) return null;

          const { sections, schemaHash } = buildFormVersionSnapshot(template);
          if (!sections.length) return null;

          const latest = await tx.formTemplateVersion.findFirst({
            where: { formTemplateId },
            orderBy: { version: "desc" },
            select: {
              id: true,
              version: true,
              schemaHash: true,
              name: true,
              sections: true,
            },
          });
          if (latest?.schemaHash === schemaHash) {
            return {
              id: latest.id,
              version: latest.version,
              name: latest.name,
              sections: readStoredSections(latest.sections),
            };
          }

          const updated = await tx.formTemplate.update({
            where: { id: formTemplateId },
            data: { currentVersion: { increment: 1 } },
            select: { currentVersion: true },
          });
          const version = await tx.formTemplateVersion.create({
            data: {
              formTemplateId,
              version: updated.currentVersion,
              schemaHash,
              name: template.name,
              slug: template.slug,
              compositionKeys: template.sectionKeys,
              sections: sections as unknown as Prisma.InputJsonValue,
            },
            select: { id: true, version: true, name: true },
          });

          return { ...version, sections };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        ["P2034", "P2002"].includes((error as { code?: string }).code ?? "") &&
        attempt < 4
      )
        continue;
      throw error;
    }
  }
  return null;
}
