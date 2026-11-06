import {
  FORM_SECTION_BY_KEY,
  isSectionKey,
  type RepeatableGroupDefinition,
  type SectionDefinition,
  type SectionKey,
  type VisibilityRule,
} from "./sections";

export type CompositionPart =
  | { kind: "section"; sectionKey: SectionKey }
  | { kind: "question"; sectionKey: SectionKey; itemId: string }
  | {
      kind: "group";
      sectionKey: SectionKey;
      itemId: string;
      fieldIds: readonly string[] | null;
    };

export function sectionPartKey(sectionKey: SectionKey): string {
  // Legacy templates already persist the bare section key.
  return sectionKey;
}

export function questionPartKey(
  sectionKey: SectionKey,
  itemId: string,
): string {
  return `q:${sectionKey}:${itemId}`;
}

export function groupPartKey(
  sectionKey: SectionKey,
  itemId: string,
  fieldIds: readonly string[] | null = null,
): string {
  return `g:${sectionKey}:${itemId}${fieldIds ? `:${fieldIds.join(",")}` : ""}`;
}

export function parseCompositionPart(key: string): CompositionPart | null {
  if (isSectionKey(key)) return { kind: "section", sectionKey: key };

  const parts = key.split(":");
  if (parts.length < 3 || parts.length > 4) return null;
  if (!isSectionKey(parts[1])) return null;
  const source = FORM_SECTION_BY_KEY.get(parts[1]);
  if (!source) return null;
  const item = source.items.find(({ id }) => id === parts[2]);
  if (!item) return null;

  if (parts[0] === "q" && parts.length === 3 && item.kind === "question") {
    return { kind: "question", sectionKey: source.key, itemId: item.id };
  }
  if (parts[0] !== "g" || item.kind !== "repeatable") return null;
  if (parts.length === 3) {
    return {
      kind: "group",
      sectionKey: source.key,
      itemId: item.id,
      fieldIds: null,
    };
  }

  const fieldIds = parts[3].split(",");
  const known = new Set(item.fields.map(({ id }) => id));
  if (
    !fieldIds.length ||
    fieldIds.some((id) => !known.has(id)) ||
    new Set(fieldIds).size !== fieldIds.length ||
    fieldIds.join(",") !==
      item.fields
        .filter(({ id }) => fieldIds.includes(id))
        .map(({ id }) => id)
        .join(",")
  ) {
    return null;
  }
  return { kind: "group", sectionKey: source.key, itemId: item.id, fieldIds };
}

export function isValidComposition(keys: readonly string[]): boolean {
  if (keys.length < 1 || keys.length > 500) return false;
  const selectedSections = new Set<string>();
  const selectedItems = new Set<string>();

  for (const key of keys) {
    const part = parseCompositionPart(key);
    if (!part) return false;
    if (part.kind === "section") {
      if (selectedSections.has(part.sectionKey)) return false;
      selectedSections.add(part.sectionKey);
    } else {
      const itemKey = `${part.sectionKey}:${part.itemId}`;
      if (selectedItems.has(itemKey)) return false;
      selectedItems.add(itemKey);
    }
  }
  return ![...selectedItems].some((itemKey) =>
    selectedSections.has(itemKey.split(":")[0]),
  );
}

export function includesPart(
  keys: readonly string[],
  part: CompositionPart,
): boolean {
  return keys.some((key) => {
    const selected = parseCompositionPart(key);
    if (!selected || selected.sectionKey !== part.sectionKey) return false;
    if (selected.kind === "section") return true;
    if (part.kind === "section") return false;
    if (selected.itemId !== part.itemId || selected.kind !== part.kind)
      return false;
    if (part.kind !== "group" || selected.kind !== "group") return true;
    if (part.fieldIds === null) return selected.fieldIds === null;
    return (
      selected.fieldIds === null ||
      part.fieldIds.every((id) => selected.fieldIds?.includes(id))
    );
  });
}

export function addCompositionPart(
  keys: readonly string[],
  key: string,
  requestedIndex = keys.length,
): string[] {
  const part = parseCompositionPart(key);
  if (!part) return [...keys];
  const next = [...keys];

  if (part.kind === "section") {
    const withoutSection = next.filter((current) => {
      const selected = parseCompositionPart(current);
      return selected?.sectionKey !== part.sectionKey;
    });
    const removedBefore = next
      .slice(0, requestedIndex)
      .filter(
        (current) =>
          parseCompositionPart(current)?.sectionKey === part.sectionKey,
      ).length;
    withoutSection.splice(
      Math.max(
        0,
        Math.min(requestedIndex - removedBefore, withoutSection.length),
      ),
      0,
      key,
    );
    return withoutSection;
  }

  if (next.includes(part.sectionKey)) return next;
  const existingIndex = next.findIndex((current) => {
    const selected = parseCompositionPart(current);
    return (
      selected?.kind !== "section" &&
      selected?.sectionKey === part.sectionKey &&
      selected?.itemId === part.itemId
    );
  });
  if (existingIndex !== -1) {
    const existing = parseCompositionPart(next[existingIndex]);
    if (existing?.kind !== "group" || part.kind !== "group") return next;
    if (existing.fieldIds === null || part.fieldIds === null) {
      next[existingIndex] = groupPartKey(part.sectionKey, part.itemId);
      return next;
    }
    const group = FORM_SECTION_BY_KEY.get(part.sectionKey)?.items.find(
      ({ id }) => id === part.itemId,
    );
    if (group?.kind !== "repeatable") return next;
    const all = new Set([...existing.fieldIds, ...part.fieldIds]);
    next[existingIndex] = groupPartKey(
      part.sectionKey,
      part.itemId,
      group.fields.filter(({ id }) => all.has(id)).map(({ id }) => id),
    );
    return next;
  }

  next.splice(Math.max(0, Math.min(requestedIndex, next.length)), 0, key);
  return next;
}

export function removeGroupField(
  keys: readonly string[],
  sectionKey: SectionKey,
  groupId: string,
  fieldId: string,
): string[] {
  return keys.flatMap((key) => {
    const part = parseCompositionPart(key);
    if (
      part?.kind !== "group" ||
      part.sectionKey !== sectionKey ||
      part.itemId !== groupId
    )
      return [key];
    const group = FORM_SECTION_BY_KEY.get(sectionKey)?.items.find(
      ({ id }) => id === groupId,
    );
    if (group?.kind !== "repeatable") return [key];
    const current = part.fieldIds ?? group.fields.map(({ id }) => id);
    const next = current.filter((id) => id !== fieldId);
    return next.length ? [groupPartKey(sectionKey, groupId, next)] : [];
  });
}

export function removeQuestionFromSection(
  keys: readonly string[],
  sectionKey: SectionKey,
  itemId: string,
  fieldId?: string,
): string[] {
  const section = FORM_SECTION_BY_KEY.get(sectionKey);
  if (!section) return [...keys];
  return keys.flatMap((key) => {
    if (key !== sectionKey) return [key];
    return section.items.flatMap((item) => {
      if (item.kind === "question") {
        return item.id === itemId ? [] : [questionPartKey(sectionKey, item.id)];
      }
      if (item.id !== itemId) return [groupPartKey(sectionKey, item.id)];
      if (!fieldId) return [];
      const remaining = item.fields
        .filter(({ id }) => id !== fieldId)
        .map(({ id }) => id);
      return remaining.length
        ? [groupPartKey(sectionKey, item.id, remaining)]
        : [];
    });
  });
}

function availableRule(
  rule: VisibilityRule | undefined,
  availableIds: ReadonlySet<string>,
): VisibilityRule | undefined {
  if (!rule) return undefined;
  if ("anyOf" in rule) {
    const anyOf = rule.anyOf.filter(({ fieldId }) => availableIds.has(fieldId));
    return anyOf.length ? { anyOf } : undefined;
  }
  return availableIds.has(rule.fieldId) ? rule : undefined;
}

export function resolveFormSections(
  keys: readonly string[],
): SectionDefinition[] {
  const result: SectionDefinition[] = [];
  const priorQuestions = new Map<SectionKey, Set<string>>();

  for (const key of keys) {
    const part = parseCompositionPart(key);
    if (!part) continue;
    const source = FORM_SECTION_BY_KEY.get(part.sectionKey)!;
    let items: SectionDefinition["items"];

    if (part.kind === "section") {
      items = source.items;
      priorQuestions.set(
        part.sectionKey,
        new Set(
          source.items
            .filter((item) => item.kind === "question")
            .map(({ id }) => id),
        ),
      );
    } else {
      const item = source.items.find(({ id }) => id === part.itemId)!;
      const available =
        priorQuestions.get(part.sectionKey) ?? new Set<string>();
      if (part.kind === "question" && item.kind === "question") {
        items = [
          { ...item, visibleWhen: availableRule(item.visibleWhen, available) },
        ];
        available.add(item.id);
        priorQuestions.set(part.sectionKey, available);
      } else if (part.kind === "group" && item.kind === "repeatable") {
        const selectedIds = new Set(
          part.fieldIds ?? item.fields.map(({ id }) => id),
        );
        const fields = item.fields
          .filter(({ id }) => selectedIds.has(id))
          .map((field) => ({
            ...field,
            visibleWhen: availableRule(field.visibleWhen, selectedIds),
          }));
        items = [
          {
            ...item,
            fields,
            minimumItems: fields.some((field) => field.required)
              ? item.minimumItems
              : 0,
            visibleWhen: availableRule(item.visibleWhen, available),
          } satisfies RepeatableGroupDefinition,
        ];
      } else {
        continue;
      }
    }

    const last = result.at(-1);
    if (part.kind !== "section" && last?.key === source.key) {
      result[result.length - 1] = { ...last, items: [...last.items, ...items] };
    } else {
      result.push({ ...source, items });
    }
  }
  return result;
}
