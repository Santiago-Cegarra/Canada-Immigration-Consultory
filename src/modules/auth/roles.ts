import { Role } from "@/generated/prisma/enums";

/*
 * Reglas de acceso del personal, en un solo sitio para que el proxy y las
 * páginas apliquen exactamente la misma regla.
 *
 * Este archivo lo carga el proxy en cada petición, así que debe seguir siendo
 * ligero: `enums` son solo constantes, no Prisma Client.
 */

const ROLES: readonly string[] = Object.values(Role);

/**
 * Comprueba en tiempo de ejecución que un valor es un rol válido. Auth.js tipa
 * los campos propios del JWT como `unknown`, y su tipo no se puede extender
 * desde `next-auth/jwt` (solo lo reexporta), así que se valida aquí.
 */
export function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLES.includes(value);
}

export function canAccessAdminPanel(
  user: { role?: Role } | null | undefined,
): boolean {
  return user?.role === Role.ADMIN;
}
