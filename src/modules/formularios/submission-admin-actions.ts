"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/modules/auth/guards";

export async function updateSubmissionStatus(
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const parsed = z
    .object({
      id: z.string().min(1).max(100),
      status: z.enum(["SUBMITTED", "IN_REVIEW", "COMPLETED"]),
    })
    .safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return;

  await db.formSubmission.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });
  revalidatePath("/admin/entregas");
  revalidatePath(`/admin/entregas/${parsed.data.id}`);
}
