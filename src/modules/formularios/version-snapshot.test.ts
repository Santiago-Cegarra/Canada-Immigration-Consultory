import { describe, expect, it } from "vitest";
import {
  buildFormVersionSnapshot,
  readStoredSections,
} from "./version-snapshot";

describe("versiones históricas de formularios", () => {
  it("conserva preguntas y orden exactos, y cambia el hash al cambiar la composición", () => {
    const base = {
      name: "Permiso de estudios",
      slug: "study-permit",
      sectionKeys: ["q:personal-data:givenNames", "q:personal-data:surnames"],
    };
    const first = buildFormVersionSnapshot(base);
    const again = buildFormVersionSnapshot(base);
    const reordered = buildFormVersionSnapshot({
      ...base,
      sectionKeys: [...base.sectionKeys].reverse(),
    });
    expect(first.schemaHash).toBe(again.schemaHash);
    expect(first.schemaHash).not.toBe(reordered.schemaHash);
    expect(first.sections[0].items.map(({ id }) => id)).toEqual([
      "givenNames",
      "surnames",
    ]);
    expect(
      readStoredSections(JSON.parse(JSON.stringify(first.sections))),
    ).toEqual(first.sections);
  });
});
