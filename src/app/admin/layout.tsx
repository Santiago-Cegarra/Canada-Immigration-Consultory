import Link from "next/link";
import { requireAdmin } from "@/modules/auth/guards";

function AdminIcon({ children }: { children: string }) {
  return (
    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
      {children}
    </span>
  );
}

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-surface-container-low">
      <header className="border-b border-outline-variant/60 bg-surface-container-lowest">
        <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-4 px-margin-mobile py-4 md:px-gutter">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-on-primary">
              <AdminIcon>shield_person</AdminIcon>
            </span>
            <div>
              <p className="font-headline-md text-lg leading-5">
                Administración
              </p>
              <p className="text-xs text-on-surface-variant">
                Help Immigration Canada
              </p>
            </div>
          </Link>

          <nav
            className="flex items-center gap-2"
            aria-label="Panel de administración"
          >
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-surface-container"
            >
              <AdminIcon>dashboard</AdminIcon> Resumen
            </Link>
            <Link
              href="/admin/formularios"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-surface-container"
            >
              <AdminIcon>description</AdminIcon> Formularios
            </Link>
            <Link
              href="/admin/accesos"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-surface-container"
            >
              <AdminIcon>key</AdminIcon> Accesos
            </Link>
          </nav>

          <div className="hidden text-right text-sm md:block">
            <p className="font-medium">{session.user.email}</p>
            <p className="text-xs text-on-surface-variant">Administrador</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-page px-margin-mobile py-8 md:px-gutter">
        {children}
      </main>
    </div>
  );
}
