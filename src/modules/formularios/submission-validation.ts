import type {
  QuestionDefinition,
  SectionDefinition,
  VisibilityRule,
} from "./sections";

type Answers = Record<string, string>;
type JsonObject = Record<string, unknown>;

export type SanitizedSubmission =
  | {
      ok: true;
      data: JsonObject;
      sensitiveData: JsonObject;
      personName: string | null;
    }
  | { ok: false; message: string };

function matchesRule(
  rule: VisibilityRule | undefined,
  sectionKey: string,
  answers: Answers,
): boolean {
  if (!rule) return true;
  const matches = ({
    fieldId,
    equals,
  }: {
    fieldId: string;
    equals: string | boolean;
  }) => {
    const answer = answers[`${sectionKey}.${fieldId}`];
    return typeof equals === "boolean"
      ? answer === (equals ? "yes" : "no")
      : answer === equals;
  };
  return "anyOf" in rule ? rule.anyOf.some(matches) : matches(rule);
}

function isUnderMinimumAge(
  minimumAge: number | undefined,
  answers: Answers,
  now: Date,
): boolean {
  if (!minimumAge) return false;
  const rawBirthDate = answers["personal-data.birthDate"];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(rawBirthDate ?? "")) return false;

  const birthDate = new Date(`${rawBirthDate}T00:00:00Z`);
  if (Number.isNaN(birthDate.getTime())) return false;
  let age = now.getUTCFullYear() - birthDate.getUTCFullYear();
  const birthdayHasPassed =
    now.getUTCMonth() > birthDate.getUTCMonth() ||
    (now.getUTCMonth() === birthDate.getUTCMonth() &&
      now.getUTCDate() >= birthDate.getUTCDate());
  if (!birthdayHasPassed) age -= 1;
  return age < minimumAge;
}

function validateValue(
  question: QuestionDefinition,
  value: string,
): string | null {
  if (value.length > 10_000) return "Una respuesta es demasiado larga.";
  if (!value) return question.required ? `Falta: ${question.label}` : null;

  if (question.input === "yes-no" && !["yes", "no"].includes(value)) {
    return `Respuesta inválida: ${question.label}`;
  }
  if (
    question.input === "select" &&
    question.options &&
    !question.options.includes(value)
  ) {
    return `Opción inválida: ${question.label}`;
  }
  if (question.input === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `Fecha inválida: ${question.label}`;
  }
  if (question.input === "month" && !/^\d{4}-\d{2}$/.test(value)) {
    return `Mes inválido: ${question.label}`;
  }
  if (question.input === "email" && !/^\S+@\S+\.\S+$/.test(value)) {
    return `Email inválido: ${question.label}`;
  }
  return null;
}

function knownAnswerPath(
  path: string,
  sections: readonly SectionDefinition[],
): boolean {
  const parts = path.split(".");
  const section = sections.find(({ key }) => key === parts[0]);
  if (!section) return false;
  const item = section.items.find(({ id }) => id === parts[1]);
  if (!item) return false;
  if (item.kind === "question") return parts.length === 2;
  if (parts.length !== 4 || !/^\d+$/.test(parts[2])) return false;
  return item.fields.some(({ id }) => id === parts[3]);
}

export function sanitizeSubmission(
  sections: readonly SectionDefinition[],
  input: unknown,
  now: Date = new Date(),
): SanitizedSubmission {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      ok: false,
      message: "Las respuestas no tienen un formato válido.",
    };
  }

  const answers: Answers = {};
  for (const [path, value] of Object.entries(input)) {
    if (typeof value !== "string" || !knownAnswerPath(path, sections)) {
      return {
        ok: false,
        message: "El formulario contiene un campo inválido.",
      };
    }
    answers[path] = value.trim();
  }

  const data: JsonObject = {};
  const sensitiveData: JsonObject = {};

  for (const section of sections) {
    if (isUnderMinimumAge(section.minimumAge, answers, now)) continue;
    const sectionData: JsonObject = {};

    for (const item of section.items) {
      if (!matchesRule(item.visibleWhen, section.key, answers)) continue;

      if (item.kind === "question") {
        const value = answers[`${section.key}.${item.id}`] ?? "";
        const error = validateValue(item, value);
        if (error) return { ok: false, message: error };
        if (value) sectionData[item.id] = value;
        continue;
      }

      const prefix = `${section.key}.${item.id}.`;
      const indexes = [
        ...new Set(
          Object.keys(answers)
            .filter((path) => path.startsWith(prefix))
            .map((path) => Number(path.split(".")[2]))
            .filter(Number.isInteger),
        ),
      ].sort((a, b) => a - b);

      if (indexes.length < (item.minimumItems ?? 0)) {
        return {
          ok: false,
          message: `Agrega al menos un registro en “${item.title}”.`,
        };
      }

      const rows: JsonObject[] = [];
      for (const index of indexes) {
        const row: JsonObject = {};
        for (const field of item.fields) {
          const value = answers[`${prefix}${index}.${field.id}`] ?? "";
          const error = validateValue(field, value);
          if (error) return { ok: false, message: error };
          if (value) row[field.id] = value;
        }
        if (Object.keys(row).length) rows.push(row);
      }
      if (rows.length) sectionData[item.id] = rows;
    }

    if (!Object.keys(sectionData).length) continue;
    (section.sensitive ? sensitiveData : data)[section.key] = sectionData;
  }

  const personal = data["personal-data"];
  const personName =
    personal && typeof personal === "object" && !Array.isArray(personal)
      ? [(personal as JsonObject).givenNames, (personal as JsonObject).surnames]
          .filter((value): value is string => typeof value === "string")
          .join(" ") || null
      : null;

  return { ok: true, data, sensitiveData, personName };
}
