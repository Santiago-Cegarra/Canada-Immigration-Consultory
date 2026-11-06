import { FORM_SECTIONS } from "../src/modules/formularios/sections";

for (const section of FORM_SECTIONS) {
  const questionIds = section.items.flatMap((item) =>
    item.kind === "question"
      ? [item.id]
      : item.fields.map((field) => `${item.id}.${field.id}`),
  );
  console.log(
    JSON.stringify({
      number: section.number,
      key: section.key,
      title: section.title,
      sensitive: Boolean(section.sensitive),
      questionCount: questionIds.length,
      questionIds,
    }),
  );
}
