import type { DefaultSession } from "next-auth";
import type { Role } from "@/generated/prisma/enums";

// El rol sale del enum que genera Prisma, así que si cambia el esquema estos
// tipos cambian con él.
//
// El JWT no se extiende aquí: `next-auth/jwt` solo reexporta el tipo de
// `@auth/core` y TypeScript no permite ampliarlo por esa vía. El rol del token
// se valida en tiempo de ejecución con `isRole` (ver `modules/auth/roles.ts`).

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
  }
}
