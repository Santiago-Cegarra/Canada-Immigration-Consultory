// Debe ir primero: carga `.env` antes de que `lib/db` lea DATABASE_URL.
import "dotenv/config";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { db } from "../../src/lib/db";
import { isValidComposition } from "../../src/modules/formularios/composition";

/**
 * Inserta en la base de datos los planes generados por `build_plan.py`, siempre
 * como borrador. Valida la composición con la misma función que usa el panel.
 *
 * - Si el slug no existe, crea el formulario.
 * - Si existe, lo omite. Con `--update` reemplaza su composición, pero solo si
 *   sigue en borrador y no tiene envíos.
 *
 * Uso: pnpm exec tsx scripts/forms-import/import-form-templates.ts [--update] <plan.json | carpeta>...
 * Atajo para los planes versionados en `plans/`: pnpm db:import-forms
 */

type Plan = {
  name: string;
  slug: string;
  description?: string;
  sectionKeys: string[];
};

function readPlan(path: string): Plan {
  const plan = JSON.parse(readFileSync(path, "utf8")) as Plan;
  if (!isValidComposition(plan.sectionKeys)) {
    throw new Error(`${path}: composición inválida.`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(plan.slug)) {
    throw new Error(`${path}: slug inválido.`);
  }
  if (plan.name.length < 3 || plan.name.length > 100) {
    throw new Error(`${path}: el nombre debe tener entre 3 y 100 caracteres.`);
  }
  return plan;
}

async function importPlan(plan: Plan, update: boolean) {
  const description = (plan.description ?? "").slice(0, 500) || null;
  const existing = await db.formTemplate.findUnique({
    where: { slug: plan.slug },
    select: {
      id: true,
      status: true,
      _count: { select: { submissions: true } },
    },
  });

  if (!existing) {
    await db.formTemplate.create({
      data: {
        name: plan.name,
        slug: plan.slug,
        description,
        sectionKeys: plan.sectionKeys,
        status: "DRAFT",
      },
    });
    console.log(`CREADO      ${plan.slug} (${plan.sectionKeys.length} partes)`);
    return;
  }
  if (!update) {
    console.log(`OMITIDO     ${plan.slug}: ya existe.`);
    return;
  }
  if (existing.status !== "DRAFT" || existing._count.submissions > 0) {
    console.log(
      `OMITIDO     ${plan.slug}: está publicado o ya tiene envíos; no se modifica.`,
    );
    return;
  }
  await db.formTemplate.update({
    where: { id: existing.id },
    data: { name: plan.name, description, sectionKeys: plan.sectionKeys },
  });
  console.log(`ACTUALIZADO ${plan.slug} (${plan.sectionKeys.length} partes)`);
}

async function main() {
  const args = process.argv.slice(2);
  const update = args.includes("--update");
  // Se validan todos antes de escribir nada.
  const plans = args
    .filter((arg) => arg !== "--update")
    .flatMap((arg) =>
      statSync(arg).isDirectory()
        ? readdirSync(arg)
            .filter((file) => file.endsWith(".json"))
            .sort()
            .map((file) => join(arg, file))
        : [arg],
    )
    .map(readPlan);
  for (const plan of plans) await importPlan(plan, update);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
