import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Panel de Administración</h1>
      <p>Bienvenido, {session.user.email}</p>
      <p>Rol: <span className="font-semibold text-blue-600">{session.user.role}</span></p>
    </div>
  );
}
