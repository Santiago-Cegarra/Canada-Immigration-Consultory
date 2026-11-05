import Link from "next/link";
import { requireAdmin } from "@/modules/auth/guards";
import { FORM_SECTION_BY_KEY } from "@/modules/formularios/sections";
import { listFormTemplates } from "@/modules/formularios/templates";

export default async function FormTemplatesPage() {
  await requireAdmin();
  const templates = await listFormTemplates();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-label-md text-primary">BANCO REUTILIZABLE</p>
          <h1 className="mt-2 font-headline-lg text-3xl">Formularios</h1>
          <p className="mt-2 max-w-2xl text-on-surface-variant">
            Cada formulario reutiliza bloques del cuestionario maestro. Las
            preguntas no se duplican.
          </p>
        </div>
        <Link
          href="/admin/formularios/nuevo"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-label-md text-on-primary shadow-sm transition hover:bg-primary-container"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            add
          </span>
          Crear formulario
        </Link>
      </div>

      {templates.length ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/admin/formularios/${template.id}`}
              className="group rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm transition hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${template.status === "PUBLISHED" ? "bg-green-100 text-green-800" : "bg-surface-container text-on-surface-variant"}`}
                >
                  {template.status === "PUBLISHED" ? "Publicado" : "Borrador"}
                </span>
                <span
                  className="material-symbols-outlined text-on-surface-variant transition group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  arrow_forward
                </span>
              </div>
              <h2 className="mt-4 font-headline-md text-xl">{template.name}</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                /formularios/{template.slug}
              </p>
              {template.description && (
                <p className="mt-3 line-clamp-2 text-sm text-on-surface-variant">
                  {template.description}
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-2">
                {template.sectionKeys.slice(0, 4).map((key) => (
                  <span
                    key={key}
                    className="rounded-lg bg-primary-fixed px-2 py-1 text-xs text-on-primary-fixed-variant"
                  >
                    {FORM_SECTION_BY_KEY.get(key)?.title}
                  </span>
                ))}
                {template.sectionKeys.length > 4 && (
                  <span className="rounded-lg bg-surface-container px-2 py-1 text-xs text-on-surface-variant">
                    +{template.sectionKeys.length - 4}
                  </span>
                )}
              </div>
              <p className="mt-5 text-xs text-on-surface-variant">
                {template.sectionKeys.length} secciones · Actualizado{" "}
                {template.updatedAt.toLocaleDateString("es-CA")}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid min-h-80 place-items-center rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center">
          <div>
            <span
              className="material-symbols-outlined text-5xl text-outline"
              aria-hidden="true"
            >
              description
            </span>
            <h2 className="mt-3 font-headline-md text-xl">
              Todavía no hay formularios
            </h2>
            <p className="mt-2 text-on-surface-variant">
              Crea el primero combinando las secciones del cuestionario maestro.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
