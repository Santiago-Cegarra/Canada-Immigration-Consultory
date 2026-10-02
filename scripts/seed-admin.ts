// Debe ir primero: carga `.env` antes de que `lib/db` lea DATABASE_URL.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";

/**
 * Crea el usuario administrador inicial, o restablece su contraseña y su rol si
 * ya existe.
 *
 * Uso: `pnpm db:seed-admin`, con ADMIN_SEED_EMAIL y ADMIN_SEED_PASSWORD
 * definidos en `.env`. Las credenciales nunca van en el código: este archivo
 * está en el repositorio.
 */

const MIN_PASSWORD_LENGTH = 12;
const BCRYPT_COST = 10;

function readAdminCredentials() {
  // Misma normalización que `loginSchema`, o el admin no podría iniciar sesión.
  const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    throw new Error("Define ADMIN_SEED_EMAIL y ADMIN_SEED_PASSWORD en .env.");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `ADMIN_SEED_PASSWORD debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    );
  }

  return { email, password };
}

async function main() {
  const { email, password } = readAdminCredentials();
  const hashedPassword = await bcrypt.hash(password, BCRYPT_COST);

  const admin = await db.user.upsert({
    where: { email },
    update: { password: hashedPassword, role: "ADMIN" },
    create: {
      email,
      name: "Administrador Principal",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Usuario admin creado/actualizado:", admin.email);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
