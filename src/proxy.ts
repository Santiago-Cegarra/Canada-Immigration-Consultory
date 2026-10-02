import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Solo aplicar el middleware a las rutas de panel (admin/profesionales) 
  // y permitir el resto (marketing, public, etc.)
  matcher: ["/admin/:path*", "/panel/:path*"],
};
