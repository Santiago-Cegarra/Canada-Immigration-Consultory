"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/modules/auth/guards";
import {
  accessCookieName,
  decryptAccessKey,
  encryptAccessKey,
  findValidAccessKey,
  generateAccessKey,
  hashAccessKey,
  normalizeAccessKey,
} from "./access";

export type UnlockFormState =
  { status: "idle" } | { status: "error"; message: string };

export async function unlockForm(
  _state: UnlockFormState,
  formData: FormData,
): Promise<UnlockFormState> {
  const parsed = z
    .object({
      slug: z.string().min(1).max(100),
      accessKey: z.string().min(8).max(100),
    })
    .safeParse({
      slug: formData.get("slug"),
      accessKey: formData.get("accessKey"),
    });

  if (!parsed.success) {
    return { status: "error", message: "Escribe una clave de acceso válida." };
  }

  const access = await findValidAccessKey(
    parsed.data.slug,
    parsed.data.accessKey,
  );
  if (!access?.formTemplateId) {
    return {
      status: "error",
      message: "La clave no existe, venció o fue revocada.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(
    accessCookieName(access.formTemplateId),
    normalizeAccessKey(parsed.data.accessKey),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: `/formularios/${parsed.data.slug}`,
      expires: access.expiresAt,
    },
  );

  redirect(`/formularios/${parsed.data.slug}`);
}

export type CreateAccessKeyState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | {
      status: "created";
      accessKey: string;
      formUrl: string;
    };

export async function createAccessKey(
  _state: CreateAccessKeyState,
  formData: FormData,
): Promise<CreateAccessKeyState> {
  await requireAdmin();

  const parsed = z
    .object({
      formTemplateId: z.string().min(1),
      professionalId: z.string().min(1),
      expirationDays: z.coerce.number().int().min(1).max(120),
    })
    .safeParse({
      formTemplateId: formData.get("formTemplateId"),
      professionalId: formData.get("professionalId"),
      expirationDays: formData.get("expirationDays"),
    });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Completa el formulario, responsable y vencimiento.",
    };
  }

  const [template, professional] = await Promise.all([
    db.formTemplate.findUnique({
      where: { id: parsed.data.formTemplateId },
      select: { id: true, slug: true },
    }),
    db.user.findFirst({
      where: {
        id: parsed.data.professionalId,
        role: { in: ["PROFESSIONAL", "ADMIN"] },
      },
      select: { id: true },
    }),
  ]);

  if (!template || !professional) {
    return {
      status: "error",
      message:
        "El formulario o responsable seleccionado ya no está disponible.",
    };
  }

  const accessKey = generateAccessKey();
  const expiresAt = new Date(
    Date.now() + parsed.data.expirationDays * 24 * 60 * 60 * 1000,
  );

  await db.formToken.create({
    data: {
      token: hashAccessKey(accessKey),
      tokenEncrypted: encryptAccessKey(accessKey),
      tokenHint: accessKey.slice(-4),
      formTemplateId: template.id,
      professionalId: professional.id,
      expiresAt,
    },
  });

  revalidatePath("/admin/accesos");
  return {
    status: "created",
    accessKey,
    formUrl: `/formularios/${template.slug}`,
  };
}

export type RevealAccessKeyResult =
  { ok: true; accessKey: string } | { ok: false; message: string };

export async function revealAccessKey(
  tokenId: string,
): Promise<RevealAccessKeyResult> {
  await requireAdmin();
  const parsed = z.string().min(1).safeParse(tokenId);
  if (!parsed.success) return { ok: false, message: "Clave inválida." };

  const token = await db.formToken.findUnique({
    where: { id: parsed.data },
    select: { tokenEncrypted: true },
  });
  if (!token?.tokenEncrypted) {
    return {
      ok: false,
      message: "Esta clave antigua no puede recuperarse; genera una nueva.",
    };
  }

  try {
    return {
      ok: true,
      accessKey: decryptAccessKey(token.tokenEncrypted),
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo descifrar la clave con la configuración actual.",
    };
  }
}

export async function revokeAccessKey(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = z.string().min(1).safeParse(formData.get("id"));
  if (!id.success) return;

  await db.formToken.updateMany({
    where: { id: id.data, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  revalidatePath("/admin/accesos");
}
