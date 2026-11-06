import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicForm } from "@/modules/formularios/components/public-form";
import { AccessKeyForm } from "@/modules/formularios/components/access-key-form";
import { resolveFormSections } from "@/modules/formularios/composition";
import { findFormTemplateBySlug } from "@/modules/formularios/templates";
import { readFormAccess } from "@/modules/formularios/access";

type FormPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: FormPageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = await findFormTemplateBySlug(slug);
  return template
    ? { title: template.name, description: template.description }
    : { title: "Formulario no encontrado" };
}

export default async function GeneratedFormPage({ params }: FormPageProps) {
  const { slug } = await params;
  const template = await findFormTemplateBySlug(slug);
  if (!template?.id) notFound();

  const access = await readFormAccess(template.id, slug);
  if (!access) {
    return (
      <div className="bg-surface-container-low py-16 md:py-24">
        <div className="px-margin-mobile md:px-gutter">
          <AccessKeyForm slug={slug} formName={template.name} />
        </div>
      </div>
    );
  }

  const sections = resolveFormSections(template.sectionKeys);

  if (!sections.length) notFound();

  return (
    <div className="bg-surface-container-low py-10 md:py-16">
      <div className="mx-auto max-w-4xl px-margin-mobile md:px-gutter">
        <div className="mb-8">
          <p className="font-label-md text-primary">FORMULARIO MIGRATORIO</p>
          <h1 className="mt-2 font-headline-lg text-3xl md:text-4xl">
            {template.name}
          </h1>
          {template.description && (
            <p className="mt-3 max-w-2xl text-on-surface-variant">
              {template.description}
            </p>
          )}
          <div className="mt-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-sm text-on-surface-variant">
            <p>
              Escribe los nombres como aparecen en el pasaporte. Usa fechas
              completas en formato AAAA-MM-DD y AAAA-MM para estudios y empleos.
            </p>
            <p className="mt-1">
              Cuando corresponda, indica claramente “No aplica” o “Desconocido”;
              no dejes información ambigua.
            </p>
          </div>
        </div>

        <PublicForm
          sections={sections}
          isDraft={template.status === "DRAFT"}
          slug={slug}
        />
      </div>
    </div>
  );
}
