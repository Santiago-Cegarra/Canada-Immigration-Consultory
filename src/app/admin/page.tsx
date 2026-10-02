import { requireAdmin } from "@/modules/auth/guards";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  return (
    <div className="p-8">
      <h1 className="mb-4 text-3xl font-bold">Panel de Administración</h1>
      <p>Bienvenido, {session.user.email}</p>
      <p>
        Rol:{" "}
        <span className="font-semibold text-blue-600">{session.user.role}</span>
      </p>
    </div>
  );
}
