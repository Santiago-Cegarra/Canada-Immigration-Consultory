import type { NextAuthConfig } from "next-auth";
import { canAccessAdminPanel, isRole } from "@/modules/auth/roles";

/**
 * Configuración de Auth.js compartida por `auth.ts` (servidor) y `proxy.ts`.
 *
 * No lleva providers ni adapter a propósito: el proxy solo lee y valida el JWT
 * de la sesión, no autentica a nadie, así que no necesita cargar Prisma ni
 * bcrypt en cada petición. El provider de credenciales vive en `auth.ts`.
 */
export default {
  providers: [],
  // El provider de credenciales solo funciona con sesiones JWT.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    /**
     * Lo ejecuta el proxy en las rutas de su `matcher`. Sin este callback,
     * Auth.js deja pasar todas las peticiones.
     *
     * - Sin sesión → `false`: Auth.js redirige a `/login`.
     * - Con sesión pero sin rol de admin → a la portada.
     *
     * Es una comprobación optimista; cada página vuelve a validar con
     * `requireAdmin()` (ver `modules/auth/guards.ts`).
     */
    authorized({ auth, request }) {
      if (request.nextUrl.pathname.startsWith("/admin")) {
        if (!auth?.user) return false;
        if (!canAccessAdminPanel(auth.user)) {
          return Response.redirect(new URL("/", request.nextUrl));
        }
      }
      return true;
    },
    jwt({ token, user }) {
      // `user` solo existe en el momento del inicio de sesión: ahí se copia el
      // rol al token para no consultar la base de datos en cada petición.
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      if (isRole(token.role)) session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
