import NextAuth from "next-auth";
import authConfig from "./auth.config";

/**
 * Proxy de Next 16 (lo que antes se llamaba "middleware"). Next busca una
 * exportación `default` o una llamada `proxy`: si se exporta con otro nombre,
 * el archivo no compila y fallan TODAS las peticiones, no solo las del matcher.
 *
 * La regla de acceso está en el callback `authorized` de `auth.config.ts`.
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Solo las rutas del personal; el sitio público no pasa por el proxy.
  matcher: ["/admin/:path*"],
};
