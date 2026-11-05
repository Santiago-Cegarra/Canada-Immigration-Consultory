import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/modules/auth/guards";
import { FormBuilder } from "@/modules/formularios/components/form-builder";
import { findFormTemplate } from "@/modules/formularios/templates";

export default async function EditFormTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const template = await findFormTemplate(id);
  if (!template) notFound();

  return (
    <div>
      <Link
        href="/admin/formularios"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary"
      >
        <span
          className="material-symbols-outlined text-[18px]"
          aria-hidden="true"
        >
          arrow_back
        </span>
        Volver a formularios
      </Link>
      <h1 className="mt-4 font-headline-lg text-3xl">Editar formulario</h1>
      <p className="mt-2 mb-8 text-on-surface-variant">
        Reordena los bloques sin duplicar ni alterar sus preguntas.
      </p>
      <FormBuilder initialTemplate={template} />
    </div>
  );
}
