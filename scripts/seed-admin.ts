import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const adminEmail = "admin@migrationcanada.com";
  const password = "AdminPassword123!"; // Cambia esto en producción
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      email: adminEmail,
      name: "Administrador Principal",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user created/updated:", admin.email);
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
