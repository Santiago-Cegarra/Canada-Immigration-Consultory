import Link from "next/link";
import { requireAdmin } from "@/modules/auth/guards";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  return (
    <div>
      <p className="font-label-md text-primary">PANEL INTERNO</p>
      <h1 className="mt-2 font-headline-lg text-3xl">
        Hola, {session.user.name ?? session.user.email}
      </h1>
      <p className="mt-2 max-w-2xl text-on-surface-variant">
        Configura los formularios que el equipo asignará a cada expediente.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/formularios"
          className="group rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
        >
          <span
            className="material-symbols-outlined text-4xl text-primary"
            aria-hidden="true"
          >
            account_tree
          </span>
          <h2 className="mt-4 font-headline-md text-xl">
            Constructor de formularios
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Combina y ordena las 17 secciones reutilizables del banco de
            preguntas.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 font-label-md text-primary">
            Abrir constructor
            <span
              className="material-symbols-outlined transition group-hover:translate-x-1"
              aria-hidden="true"
            >
              arrow_forward
            </span>
          </span>
        </Link>
        <Link
          href="/admin/accesos"
          className="group rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
        >
          <span
            className="material-symbols-outlined text-4xl text-primary"
            aria-hidden="true"
          >
            key
          </span>
          <h2 className="mt-4 font-headline-md text-xl">Claves de acceso</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Genera, consulta y revoca el acceso de cada cliente a sus
            formularios.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 font-label-md text-primary">
            Gestionar accesos
            <span
              className="material-symbols-outlined transition group-hover:translate-x-1"
              aria-hidden="true"
            >
              arrow_forward
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}
