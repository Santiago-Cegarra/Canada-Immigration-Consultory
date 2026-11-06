import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

class RollbackVerification extends Error {}

async function main() {
  const token = await db.formToken.findFirst({
    where: { formTemplateId: { not: null } },
    select: { id: true, formTemplateId: true },
  });
  if (!token?.formTemplateId) {
    throw new Error(
      "Se necesita una plantilla con clave para verificar el almacenamiento.",
    );
  }
  const template = await db.formTemplate.findUniqueOrThrow({
    where: { id: token.formTemplateId },
  });
  const before = await db.formSubmission.count();

  try {
    await db.$transaction(async (tx) => {
      const version = await tx.formTemplateVersion.create({
        data: {
          formTemplateId: template.id,
          version: template.currentVersion + 100_000,
          schemaHash: "verificacion-temporal",
          name: template.name,
          slug: template.slug,
          compositionKeys: template.sectionKeys,
          sections: [],
        },
      });
      const created = await tx.formSubmission.create({
        data: {
          tokenId: token.id,
          formTemplateId: template.id,
          formTemplateVersionId: version.id,
          personName: "Verificación temporal",
          personEmail: "test@example.invalid",
          responses: { "personal-data": { givenNames: "Verificación" } },
          sensitiveResponses: { health: { tuberculosis: "no" } },
        },
      });
      const loaded = await tx.formSubmission.findUniqueOrThrow({
        where: { id: created.id },
        include: { formTemplateVersion: true },
      });
      if (
        loaded.formTemplateVersion?.version !== version.version ||
        loaded.formTemplateId !== template.id ||
        loaded.personEmail !== "test@example.invalid" ||
        JSON.stringify(loaded.responses) !==
          JSON.stringify({ "personal-data": { givenNames: "Verificación" } })
      ) {
        throw new Error(
          "La lectura estructurada no coincide con la escritura.",
        );
      }
      throw new RollbackVerification();
    });
  } catch (error) {
    if (!(error instanceof RollbackVerification)) throw error;
  }

  if ((await db.formSubmission.count()) !== before) {
    throw new Error("La transacción de verificación dejó un envío de prueba.");
  }
  console.log(
    "Almacenamiento relacional y JSONB verificado; transacción revertida.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
