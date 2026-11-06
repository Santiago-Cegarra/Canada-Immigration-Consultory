import type { SectionDefinition } from "../sections";

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function orderedEntries(
  value: Record<string, unknown>,
  ids: readonly string[],
): [string, unknown][] {
  const positions = new Map(ids.map((id, index) => [id, index]));
  return Object.entries(value).sort(([a], [b]) => {
    const aPosition = positions.get(a) ?? Number.MAX_SAFE_INTEGER;
    const bPosition = positions.get(b) ?? Number.MAX_SAFE_INTEGER;
    return aPosition === bPosition
      ? a.localeCompare(b, "es")
      : aPosition - bPosition;
  });
}

function DisplayValue({ value }: { value: unknown }) {
  if (typeof value === "string") {
    return (
      <span className="break-words whitespace-pre-wrap">
        {value === "yes" ? "Sí" : value === "no" ? "No" : value}
      </span>
    );
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return <span>{String(value)}</span>;
  }
  return (
    <span className="break-words whitespace-pre-wrap">
      {JSON.stringify(value)}
    </span>
  );
}

export function SubmissionAnswers({
  answers,
  sections,
}: {
  answers: unknown;
  sections: readonly SectionDefinition[];
}) {
  const root = asObject(answers);
  if (!root || !Object.keys(root).length) {
    return (
      <p className="text-sm text-on-surface-variant">
        Sin respuestas en esta categoría.
      </p>
    );
  }

  const uniqueSections = new Map<string, SectionDefinition>();
  for (const section of sections) {
    const existing = uniqueSections.get(section.key);
    uniqueSections.set(
      section.key,
      existing
        ? { ...existing, items: [...existing.items, ...section.items] }
        : section,
    );
  }

  return (
    <div className="space-y-5">
      {orderedEntries(root, [...uniqueSections.keys()]).map(
        ([sectionKey, rawSection]) => {
          const values = asObject(rawSection);
          const section = uniqueSections.get(sectionKey);
          if (!values) return null;
          return (
            <section
              key={sectionKey}
              className="rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm"
            >
              <h3 className="font-headline-md text-lg">
                {section?.title ?? sectionKey}
              </h3>
              <div className="mt-4 space-y-4">
                {orderedEntries(
                  values,
                  section?.items.map(({ id }) => id) ?? [],
                ).map(([itemId, value]) => {
                  const item = section?.items.find(({ id }) => id === itemId);
                  if (Array.isArray(value)) {
                    return (
                      <div
                        key={itemId}
                        className="rounded-xl bg-surface-container-low p-4"
                      >
                        <p className="font-semibold">
                          {item?.kind === "repeatable" ? item.title : itemId}
                        </p>
                        <div className="mt-3 space-y-3">
                          {value.map((rawRow, index) => {
                            const row = asObject(rawRow);
                            return (
                              <div
                                key={index}
                                className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-3"
                              >
                                <p className="mb-2 text-xs font-semibold text-primary">
                                  Registro {index + 1}
                                </p>
                                {row ? (
                                  orderedEntries(
                                    row,
                                    item?.kind === "repeatable"
                                      ? item.fields.map(({ id }) => id)
                                      : [],
                                  ).map(([fieldId, fieldValue]) => (
                                    <div
                                      key={fieldId}
                                      className="grid gap-1 py-1 text-sm sm:grid-cols-[minmax(0,220px)_1fr]"
                                    >
                                      <span className="text-on-surface-variant">
                                        {item?.kind === "repeatable"
                                          ? (item.fields.find(
                                              ({ id }) => id === fieldId,
                                            )?.label ?? fieldId)
                                          : fieldId}
                                      </span>
                                      <span>
                                        <DisplayValue value={fieldValue} />
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <DisplayValue value={rawRow} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={itemId}
                      className="grid gap-1 border-b border-outline-variant/40 pb-3 text-sm last:border-0 last:pb-0 sm:grid-cols-[minmax(0,280px)_1fr]"
                    >
                      <span className="text-on-surface-variant">
                        {item?.kind === "question" ? item.label : itemId}
                      </span>
                      <span className="font-medium">
                        <DisplayValue value={value} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        },
      )}
    </div>
  );
}
