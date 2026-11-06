import "server-only";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { hashAccessKey } from "./access-crypto";

export {
  decryptAccessKey,
  encryptAccessKey,
  generateAccessKey,
  hashAccessKey,
  normalizeAccessKey,
} from "./access-crypto";

export function accessCookieName(templateId: string): string {
  return `hic_form_${templateId}`;
}

export function completedFormCookieName(templateId: string): string {
  return `hic_form_completed_${templateId}`;
}

export async function findValidAccessKey(slug: string, accessKey: string) {
  const tokenHash = hashAccessKey(accessKey);

  return db.formToken.findFirst({
    where: {
      token: tokenHash,
      formTemplate: { slug },
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      expiresAt: true,
      formTemplateId: true,
    },
  });
}

export async function readFormAccess(templateId: string, slug: string) {
  const cookieStore = await cookies();
  const accessKey = cookieStore.get(accessCookieName(templateId))?.value;
  if (!accessKey) return null;
  return findValidAccessKey(slug, accessKey);
}

export async function listAccessKeys() {
  return db.formToken.findMany({
    where: { formTemplateId: { not: null } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      tokenHint: true,
      expiresAt: true,
      revokedAt: true,
      lastUsedAt: true,
      createdAt: true,
      formTemplate: { select: { name: true, slug: true } },
      professional: { select: { name: true, email: true } },
      _count: { select: { submissions: true } },
    },
  });
}

export async function listAccessKeyOptions() {
  const [templates, professionals] = await Promise.all([
    db.formTemplate.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, status: true },
    }),
    db.user.findMany({
      where: { role: { in: ["PROFESSIONAL", "ADMIN"] } },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: { id: true, name: true, email: true, role: true },
    }),
  ]);

  return { templates, professionals };
}
