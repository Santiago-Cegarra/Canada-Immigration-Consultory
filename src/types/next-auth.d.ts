import { DefaultSession } from "next-auth";

// Tipar la sesión para incluir el rol del usuario
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "PROFESSIONAL";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "ADMIN" | "PROFESSIONAL";
  }
}
