import { writeFileSync } from "node:fs";
import { FORM_SECTIONS } from "../../src/modules/formularios/sections";

/**
 * Exporta el banco de preguntas a JSON para que los scripts de Python puedan
 * leerlo. Solo lectura: no toca la base de datos.
 *
 * Uso: pnpm exec tsx scripts/forms-import/export-form-bank.ts <salida.json>
 */
const output = process.argv[2];
if (!output) throw new Error("Indica la ruta del archivo de salida.");
writeFileSync(output, JSON.stringify(FORM_SECTIONS, null, 1));
console.log(`Banco exportado: ${FORM_SECTIONS.length} secciones.`);
