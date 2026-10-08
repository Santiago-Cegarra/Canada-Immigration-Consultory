import { z } from "zod";

/**
 * Validación de las credenciales de inicio de sesión: es el límite del sistema,
 * así que nada llega a la base de datos sin pasar por aquí.
 *
 * El email se normaliza (sin espacios, en minúsculas) porque el índice único de
 * `User.email` en Postgres distingue mayúsculas: sin esto, "Admin@x.com" y
 * "admin@x.com" serían usuarios distintos.
 */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1),
});
