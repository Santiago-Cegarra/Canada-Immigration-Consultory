import Link from "next/link";
import { requireAdmin } from "@/modules/auth/guards";
import { FormBuilder } from "@/modules/formularios/components/form-builder";

export default async function NewFormTemplatePage() {
  await requireAdmin();

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
      <h1 className="mt-4 font-headline-lg text-3xl">Nuevo formulario</h1>
      <p className="mt-2 mb-8 text-on-surface-variant">
        Selecciona bloques completos o preguntas individuales, ordénalos y
        guarda.
      </p>
      <FormBuilder />
    </div>
  );
}
