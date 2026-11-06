import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/modules/auth/guards";
import { resolveFormSections } from "@/modules/formularios/composition";
import { SubmissionAnswers } from "@/modules/formularios/components/submission-answers";
import { updateSubmissionStatus } from "@/modules/formularios/submission-admin-actions";
import { readStoredSections } from "@/modules/formularios/version-snapshot";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const submission = await db.formSubmission.findUnique({
    where: { id },
    include: {
      formTemplate: { select: { name: true, sectionKeys: true } },
      formTemplateVersion: {
        select: { name: true, version: true, sections: true },
      },
      token: {
        select: {
          tokenHint: true,
          professional: { select: { name: true, email: true } },
        },
      },
    },
  });
  if (!submission) notFound();

  const historicalSections = readStoredSections(
    submission.formTemplateVersion?.sections,
  );
  const sections = historicalSections.length
    ? historicalSections
    : resolveFormSections(submission.formTemplate?.sectionKeys ?? []);

  return (
    <div>
      <Link
        href="/admin/entregas"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary"
      >
        <span
          className="material-symbols-outlined text-[18px]"
          aria-hidden="true"
        >
          arrow_back
        </span>
        Volver a entregas
      </Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="font-label-md text-primary">ENTREGA DEL FORMULARIO</p>
          <h1 className="mt-2 font-headline-lg text-3xl">
            {submission.personName}
          </h1>
          <p className="mt-2 text-on-surface-variant">
            {submission.formTemplateVersion?.name ??
              submission.formTemplate?.name ??
              "Formulario anterior"}
            {submission.formTemplateVersion
              ? ` · versión ${submission.formTemplateVersion.version}`
              : " · sin versión histórica"}
          </p>
        </div>
        <form
          action={updateSubmissionStatus}
          className="flex flex-wrap items-end gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-3"
        >
          <input type="hidden" name="id" value={submission.id} />
          <label className="space-y-1 text-sm">
            <span className="block">Estado</span>
            <select
              name="status"
              defaultValue={submission.status}
              className="rounded-lg border border-outline-variant bg-surface px-3 py-2"
            >
              <option value="SUBMITTED">Entregado</option>
              <option value="IN_REVIEW">En revisión</option>
              <option value="COMPLETED">Completado</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary"
          >
            Guardar estado
          </button>
        </form>
      </div>

      <dl className="mt-6 grid gap-3 rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-on-surface-variant">Entregado</dt>
          <dd className="mt-1 font-medium">
            <time dateTime={submission.createdAt.toISOString()}>
              {submission.createdAt.toLocaleString("es-VE", {
                dateStyle: "long",
                timeStyle: "short",
                timeZone: "America/Caracas",
              })}
            </time>
          </dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">Correo del solicitante</dt>
          <dd className="mt-1 font-medium break-all">
            {submission.personEmail ?? "No proporcionado"}
          </dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">Responsable de la clave</dt>
          <dd className="mt-1 font-medium">
            {submission.token.professional.name ??
              submission.token.professional.email}
          </dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">Clave utilizada</dt>
          <dd className="mt-1 font-medium">
            Terminación {submission.token.tokenHint ?? "desconocida"}
          </dd>
        </div>
      </dl>

      {!submission.formTemplateVersion && (
        <p className="mt-5 rounded-xl border border-outline-variant bg-secondary-container p-4 text-sm text-on-secondary-container">
          Este envío es anterior al versionado. Las etiquetas se muestran con el
          cuestionario actual cuando está disponible; las respuestas originales
          se conservan.
        </p>
      )}

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <section>
          <h2 className="mb-4 font-headline-md text-xl">
            Respuestas generales
          </h2>
          <SubmissionAnswers
            answers={submission.responses}
            sections={sections}
          />
        </section>
        <section>
          <h2 className="mb-4 font-headline-md text-xl">
            Salud y antecedentes
          </h2>
          <SubmissionAnswers
            answers={submission.sensitiveResponses}
            sections={sections}
          />
        </section>
      </div>
    </div>
  );
}
