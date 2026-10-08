import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { canAccessAdminPanel } from "./roles";

/**
 * Exige una sesión de administrador. Llamarlo al principio de CADA página y
 * Server Action del panel de admin.
 *
 * El proxy ya filtra `/admin`, pero Next recomienda tratarlo como una
 * comprobación optimista: la autorización real tiene que hacerse en el
 * servidor, junto a los datos. Un layout no sirve para esto porque no se
 * vuelve a ejecutar al navegar entre páginas hermanas.
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!canAccessAdminPanel(session.user)) redirect("/");

  return session;
}
