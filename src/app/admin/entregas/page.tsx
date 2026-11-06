import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/modules/auth/guards";

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "Entregado",
  IN_REVIEW: "En revisión",
  COMPLETED: "Completado",
};

type Search = {
  q?: string | string[];
  form?: string | string[];
  status?: string | string[];
  page?: string | string[];
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const search = first(query.q).trim().slice(0, 100);
  const formId = first(query.form);
  const rawStatus = first(query.status);
  const status = ["SUBMITTED", "IN_REVIEW", "COMPLETED"].includes(rawStatus)
    ? (rawStatus as "SUBMITTED" | "IN_REVIEW" | "COMPLETED")
    : undefined;
  const page = Math.max(
    1,
    Math.min(Number.parseInt(first(query.page), 10) || 1, 10000),
  );

  const baseWhere = {
    ...(formId ? { formTemplateId: formId } : {}),
    ...(search
      ? {
          OR: [
            { personName: { contains: search, mode: "insensitive" as const } },
            { personEmail: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const where = { ...baseWhere, ...(status ? { status } : {}) };
  const [forms, count, statusCounts, submissions] = await Promise.all([
    db.formTemplate.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.formSubmission.count({ where }),
    db.formSubmission.groupBy({
      by: ["status"],
      where: baseWhere,
      _count: { _all: true },
    }),
    db.formSubmission.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * 25,
      take: 25,
      select: {
        id: true,
        personName: true,
        personEmail: true,
        status: true,
        createdAt: true,
        formTemplate: { select: { name: true } },
        formTemplateVersion: { select: { name: true, version: true } },
      },
    }),
  ]);

  function pageUrl(nextPage: number): string {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (formId) params.set("form", formId);
    if (status) params.set("status", status);
    params.set("page", String(nextPage));
    return `/admin/entregas?${params.toString()}`;
  }

  return (
    <div>
      <p className="font-label-md text-primary">RESPUESTAS RECIBIDAS</p>
      <h1 className="mt-2 font-headline-lg text-3xl">
        Entregas de formularios
      </h1>
      <p className="mt-2 text-on-surface-variant">
        Consulta cada envío, su versión y el estado de revisión. {count}{" "}
        {count === 1 ? "entrega" : "entregas"} en esta vista.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {Object.entries(STATUS_LABEL).map(([key, label]) => (
          <div
            key={key}
            className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-4"
          >
            <p className="text-sm text-on-surface-variant">{label}</p>
            <p className="mt-1 font-headline-md text-2xl">
              {statusCounts.find(({ status }) => status === key)?._count._all ??
                0}
            </p>
          </div>
        ))}
      </div>

      <form
        method="get"
        className="mt-7 grid gap-3 rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-4 md:grid-cols-[1fr_220px_180px_auto]"
      >
        <label className="space-y-1 text-sm">
          <span>Nombre o correo</span>
          <input
            name="q"
            defaultValue={search}
            className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2"
            placeholder="Buscar persona"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span>Formulario</span>
          <select
            name="form"
            defaultValue={formId}
            className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2"
          >
            <option value="">Todos</option>
            {forms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span>Estado</span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2"
          >
            <option value="">Todos</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="self-end rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary"
        >
          Filtrar
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border border-outline-variant/70 bg-surface-container-lowest shadow-sm">
        {submissions.length ? (
          <div className="divide-y divide-outline-variant/60">
            {submissions.map((submission) => (
              <Link
                key={submission.id}
                href={`/admin/entregas/${submission.id}`}
                className="flex flex-wrap items-center justify-between gap-3 p-5 transition hover:bg-surface-container-low"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{submission.personName}</p>
                  <p className="mt-1 text-sm break-all text-on-surface-variant">
                    {submission.personEmail ?? "Sin correo"}
                  </p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {submission.formTemplateVersion?.name ??
                      submission.formTemplate?.name ??
                      "Formulario anterior"}
                    {submission.formTemplateVersion
                      ? ` · versión ${submission.formTemplateVersion.version}`
                      : " · sin versión histórica"}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="rounded-full bg-primary-fixed px-3 py-1 text-on-primary-fixed-variant">
                    {STATUS_LABEL[submission.status]}
                  </span>
                  <time
                    dateTime={submission.createdAt.toISOString()}
                    className="text-on-surface-variant"
                  >
                    {submission.createdAt.toLocaleString("es-VE", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "America/Caracas",
                    })}
                  </time>
                  <span
                    className="material-symbols-outlined text-primary"
                    aria-hidden="true"
                  >
                    arrow_forward
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="p-10 text-center text-on-surface-variant">
            Todavía no hay entregas para estos filtros.
          </p>
        )}
      </div>

      {count > 25 && (
        <nav
          aria-label="Páginas de entregas"
          className="mt-5 flex items-center justify-between text-sm"
        >
          {page > 1 ? (
            <Link
              href={pageUrl(page - 1)}
              className="text-primary hover:underline"
            >
              Anterior
            </Link>
          ) : (
            <span />
          )}
          <span>
            Página {page} de {Math.ceil(count / 25)}
          </span>
          {page * 25 < count ? (
            <Link
              href={pageUrl(page + 1)}
              className="text-primary hover:underline"
            >
              Siguiente
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
