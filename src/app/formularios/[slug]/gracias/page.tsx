import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ButtonLink } from "@/modules/marketing/components/ui/button-link";
import { completedFormCookieName } from "@/modules/formularios/access";
import { findFormTemplateBySlug } from "@/modules/formularios/templates";

export const metadata: Metadata = {
  title: "Formulario enviado",
  robots: { index: false },
};

export default async function FormThankYouPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = await findFormTemplateBySlug(slug);
  if (!template?.id) notFound();

  if (!(await cookies()).has(completedFormCookieName(template.id))) {
    redirect("/");
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-surface-container-low px-margin-mobile py-16 md:px-gutter">
      <div className="w-full max-w-xl rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-8 text-center shadow-sm md:p-12">
        <span
          className="material-symbols-outlined mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-4xl text-primary"
          aria-hidden="true"
        >
          check_circle
        </span>
        <h1 className="mt-6 font-headline-lg text-3xl text-on-surface md:text-4xl">
          ¡Gracias! Tu formulario fue enviado
        </h1>
        <p className="mt-4 text-on-surface-variant">
          Recibimos tus respuestas correctamente. Nuestro equipo podrá
          revisarlas.
        </p>
        <ButtonLink
          action={{ label: "Ir al inicio", href: "/" }}
          className="mx-auto mt-8 w-fit"
          size="md"
        />
      </div>
    </section>
  );
}
