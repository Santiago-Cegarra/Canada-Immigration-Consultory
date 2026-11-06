"use client";

import type { DragEvent, FormEvent } from "react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveFormTemplate } from "../actions";
import {
  addCompositionPart,
  groupPartKey,
  includesPart,
  parseCompositionPart,
  questionPartKey,
  removeGroupField,
  removeQuestionFromSection,
  resolveFormSections,
  sectionPartKey,
} from "../composition";
import {
  countSectionQuestions,
  FORM_SECTION_BY_KEY,
  FORM_SECTIONS,
} from "../sections";
import type { FormTemplateEditorValue } from "../types";

type DraggedPart = {
  key: string;
  source: "library" | "canvas";
};

const EMPTY_TEMPLATE: FormTemplateEditorValue = {
  name: "",
  slug: "",
  description: "",
  sectionKeys: [],
  status: "DRAFT",
};

function Icon({ children }: { children: string }) {
  return (
    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
      {children}
    </span>
  );
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function FormBuilder({
  initialTemplate = EMPTY_TEMPLATE,
}: {
  initialTemplate?: FormTemplateEditorValue;
}) {
  const router = useRouter();
  const [template, setTemplate] = useState(initialTemplate);
  const [slugWasEdited, setSlugWasEdited] = useState(
    Boolean(initialTemplate.id),
  );
  const [search, setSearch] = useState("");
  const [dragged, setDragged] = useState<DraggedPart | null>(null);
  const [message, setMessage] = useState<
    { type: "success" | "error"; text: string } | undefined
  >();
  const [isPending, startTransition] = useTransition();

  const selected = useMemo(
    () =>
      template.sectionKeys
        .map((key) => {
          const part = parseCompositionPart(key);
          const section = part && FORM_SECTION_BY_KEY.get(part.sectionKey);
          const item =
            part?.kind !== "section"
              ? section?.items.find(({ id }) => id === part?.itemId)
              : undefined;
          return part && section
            ? {
                key,
                part,
                section,
                item,
                title:
                  part.kind === "section"
                    ? section.title
                    : item?.kind === "repeatable"
                      ? item.title
                      : (item?.label ?? section.title),
                questionCount:
                  part.kind === "section"
                    ? countSectionQuestions(section)
                    : item?.kind === "repeatable"
                      ? part.kind === "group" && part.fieldIds
                        ? part.fieldIds.length
                        : item.fields.length
                      : 1,
              }
            : null;
        })
        .filter((entry) => entry !== null),
    [template.sectionKeys],
  );

  const available = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es");
    return FORM_SECTIONS.filter(
      (section) =>
        !normalizedSearch ||
        section.title.toLocaleLowerCase("es").includes(normalizedSearch) ||
        String(section.number).includes(normalizedSearch) ||
        section.items.some(
          (item) =>
            (item.kind === "question" ? item.label : item.title)
              .toLocaleLowerCase("es")
              .includes(normalizedSearch) ||
            (item.kind === "repeatable" &&
              item.fields.some((field) =>
                field.label.toLocaleLowerCase("es").includes(normalizedSearch),
              )),
        ),
    );
  }, [search]);

  const totalQuestions = resolveFormSections(template.sectionKeys).reduce(
    (total, section) => total + countSectionQuestions(section),
    0,
  );

  function update<K extends keyof FormTemplateEditorValue>(
    field: K,
    value: FormTemplateEditorValue[K],
  ) {
    setTemplate((current) => ({ ...current, [field]: value }));
    setMessage(undefined);
  }

  function addPart(key: string, index = template.sectionKeys.length) {
    setTemplate((current) => ({
      ...current,
      sectionKeys: addCompositionPart(current.sectionKeys, key, index),
    }));
    setMessage(undefined);
  }

  function removePart(key: string) {
    update(
      "sectionKeys",
      template.sectionKeys.filter((selectedKey) => selectedKey !== key),
    );
  }

  function movePart(key: string, direction: -1 | 1) {
    const from = template.sectionKeys.indexOf(key);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= template.sectionKeys.length) return;

    const next = [...template.sectionKeys];
    [next[from], next[to]] = [next[to], next[from]];
    update("sectionKeys", next);
  }

  function beginDrag(
    event: DragEvent<HTMLElement>,
    key: string,
    source: DraggedPart["source"],
  ) {
    event.stopPropagation();
    event.dataTransfer.effectAllowed = source === "library" ? "copy" : "move";
    event.dataTransfer.setData("text/plain", key);
    setDragged({ key, source });
  }

  function dropAt(event: DragEvent<HTMLElement>, requestedIndex: number) {
    event.preventDefault();
    event.stopPropagation();
    if (!dragged) return;

    if (dragged.source === "library") {
      addPart(dragged.key, requestedIndex);
    } else {
      setTemplate((current) => {
        const from = current.sectionKeys.indexOf(dragged.key);
        if (from < 0) return current;

        const next = current.sectionKeys.filter((key) => key !== dragged.key);
        const insertionIndex =
          from < requestedIndex ? requestedIndex - 1 : requestedIndex;
        next.splice(Math.max(0, insertionIndex), 0, dragged.key);
        return { ...current, sectionKeys: next };
      });
    }

    setDragged(null);
    setMessage(undefined);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(undefined);

    startTransition(async () => {
      const result = await saveFormTemplate(template);
      if (!result.ok) {
        setMessage({ type: "error", text: result.message });
        return;
      }

      setTemplate((current) => ({ ...current, id: result.id }));
      setMessage({
        type: "success",
        text: "Formulario guardado correctamente.",
      });

      if (!initialTemplate.id) {
        router.replace(`/admin/formularios/${result.id}`);
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm md:p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="font-label-md text-on-surface">
              Nombre del formulario
            </span>
            <input
              value={template.name}
              onChange={(event) => {
                const name = event.target.value;
                setTemplate((current) => ({
                  ...current,
                  name,
                  slug: slugWasEdited ? current.slug : slugify(name),
                }));
                setMessage(undefined);
              }}
              placeholder="Ej. Solicitud de permiso de estudios"
              required
              minLength={3}
              className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <label className="space-y-2">
            <span className="font-label-md text-on-surface">
              Identificador URL
            </span>
            <div className="flex items-center rounded-xl border border-outline-variant bg-surface focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
              <span className="pl-4 text-on-surface-variant">
                /formularios/
              </span>
              <input
                value={template.slug}
                onChange={(event) => {
                  setSlugWasEdited(true);
                  update("slug", slugify(event.target.value));
                }}
                placeholder="permiso-estudios"
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                className="min-w-0 flex-1 bg-transparent px-1 py-3 outline-none"
              />
            </div>
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="font-label-md text-on-surface">
              Descripción interna
            </span>
            <textarea
              value={template.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Para qué trámite se usa y a quién debe asignarse."
              maxLength={500}
              rows={2}
              className="w-full resize-y rounded-xl border border-outline-variant bg-surface px-4 py-3 transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-outline-variant/70 bg-surface-container-lowest shadow-sm xl:sticky xl:top-6">
          <div className="border-b border-outline-variant/60 p-5">
            <p className="font-headline-md text-lg">Banco de preguntas</p>
            <p className="mt-1 text-sm text-on-surface-variant">
              Despliega un bloque para ver y agregar sus preguntas. También
              puedes arrastrarlas.
            </p>
            <label className="mt-4 flex items-center gap-2 rounded-xl border border-outline-variant bg-surface px-3 py-2.5 focus-within:border-primary">
              <Icon>search</Icon>
              <span className="sr-only">Buscar bloques o preguntas</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar bloque o pregunta"
                className="min-w-0 flex-1 bg-transparent outline-none"
              />
            </label>
          </div>

          <div className="max-h-[640px] space-y-3 overflow-y-auto p-4">
            {available.map((section) => (
              <article
                key={section.key}
                className="rounded-xl border border-outline-variant/70 bg-surface p-4 transition hover:border-primary/50 hover:shadow-sm"
              >
                <div
                  draggable={!template.sectionKeys.includes(section.key)}
                  onDragStart={(event) =>
                    beginDrag(event, sectionPartKey(section.key), "library")
                  }
                  onDragEnd={() => setDragged(null)}
                  className="flex cursor-grab items-start gap-3 active:cursor-grabbing"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-fixed font-label-md text-on-primary-fixed-variant">
                    {section.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="leading-5 font-semibold">{section.title}</h3>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {countSectionQuestions(section)} preguntas
                      {section.minimumAge ? ` · ${section.minimumAge}+` : ""}
                      {section.sensitive ? " · Sensible" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addPart(sectionPartKey(section.key))}
                    disabled={template.sectionKeys.includes(section.key)}
                    className="grid size-8 shrink-0 place-items-center rounded-full text-primary transition hover:bg-primary-fixed focus-visible:outline-2 focus-visible:outline-primary"
                    aria-label={`Agregar bloque completo: ${section.title}`}
                  >
                    <Icon>add</Icon>
                  </button>
                </div>
                <details className="mt-3 border-t border-outline-variant/60 pt-2">
                  <summary className="cursor-pointer text-sm font-semibold text-primary select-none">
                    Ver {countSectionQuestions(section)} preguntas
                  </summary>
                  <div className="mt-3 space-y-2">
                    {section.items.map((item) => {
                      const itemKey =
                        item.kind === "question"
                          ? questionPartKey(section.key, item.id)
                          : groupPartKey(section.key, item.id);
                      const itemPart = parseCompositionPart(itemKey)!;
                      const isSelected = includesPart(
                        template.sectionKeys,
                        itemPart,
                      );
                      return (
                        <div
                          key={item.id}
                          className="rounded-lg bg-surface-container-low p-2"
                        >
                          <div
                            draggable={!isSelected}
                            onDragStart={(event) =>
                              beginDrag(event, itemKey, "library")
                            }
                            onDragEnd={() => setDragged(null)}
                            className="flex cursor-grab items-start gap-2 active:cursor-grabbing"
                          >
                            <span
                              className="mt-0.5 text-on-surface-variant"
                              aria-hidden="true"
                            >
                              <Icon>drag_indicator</Icon>
                            </span>
                            <span className="min-w-0 flex-1 text-sm leading-5">
                              {item.kind === "question"
                                ? item.label
                                : item.title}
                              {item.kind === "repeatable" && (
                                <span className="block text-xs text-on-surface-variant">
                                  Grupo repetible · {item.fields.length}{" "}
                                  preguntas
                                </span>
                              )}
                            </span>
                            <button
                              type="button"
                              disabled={isSelected}
                              onClick={() => addPart(itemKey)}
                              className="grid size-7 shrink-0 place-items-center rounded-full text-primary hover:bg-primary-fixed disabled:opacity-40"
                              aria-label={`Agregar ${item.kind === "question" ? item.label : item.title}`}
                            >
                              <Icon>{isSelected ? "check" : "add"}</Icon>
                            </button>
                          </div>
                          {item.kind === "repeatable" && (
                            <details className="mt-2 ml-7">
                              <summary className="cursor-pointer text-xs text-primary">
                                Ver preguntas del grupo
                              </summary>
                              <div className="mt-2 space-y-1">
                                {item.fields.map((field) => {
                                  const fieldKey = groupPartKey(
                                    section.key,
                                    item.id,
                                    [field.id],
                                  );
                                  const fieldSelected = includesPart(
                                    template.sectionKeys,
                                    parseCompositionPart(fieldKey)!,
                                  );
                                  return (
                                    <div
                                      key={field.id}
                                      draggable={!fieldSelected}
                                      onDragStart={(event) =>
                                        beginDrag(event, fieldKey, "library")
                                      }
                                      onDragEnd={() => setDragged(null)}
                                      className="flex cursor-grab items-start gap-2 rounded-md border border-outline-variant/60 bg-surface p-2 text-xs active:cursor-grabbing"
                                    >
                                      <span className="min-w-0 flex-1">
                                        {field.label}
                                      </span>
                                      <button
                                        type="button"
                                        disabled={fieldSelected}
                                        onClick={() => addPart(fieldKey)}
                                        className="shrink-0 font-semibold text-primary disabled:opacity-40"
                                        aria-label={`Agregar ${field.label}`}
                                      >
                                        {fieldSelected ? "Incluida" : "Agregar"}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </details>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </details>
              </article>
            ))}

            {available.length === 0 && (
              <p className="px-2 py-8 text-center text-sm text-on-surface-variant">
                No hay bloques o preguntas que coincidan.
              </p>
            )}
          </div>
        </aside>

        <section className="min-w-0 rounded-2xl border border-outline-variant/70 bg-surface-container-lowest shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/60 p-5 md:p-6">
            <div>
              <h2 className="font-headline-md text-xl">
                Estructura del formulario
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                {selected.length} elementos · {totalQuestions} preguntas
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <Icon>drag_indicator</Icon>
              Arrastra para ordenar
            </div>
          </header>

          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => dropAt(event, template.sectionKeys.length)}
            className="min-h-[460px] space-y-3 p-4 md:p-6"
          >
            {selected.map((entry, index) => (
              <article
                key={entry.key}
                draggable
                onDragStart={(event) => beginDrag(event, entry.key, "canvas")}
                onDragEnd={() => setDragged(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => dropAt(event, index)}
                className={`rounded-xl border bg-surface-container-lowest p-4 transition md:p-5 ${
                  dragged?.key === entry.key
                    ? "border-primary opacity-50"
                    : "border-outline-variant/80 hover:border-outline"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 cursor-grab text-on-surface-variant active:cursor-grabbing">
                    <Icon>drag_indicator</Icon>
                  </span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary font-label-md text-on-primary">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{entry.title}</h3>
                      <span className="rounded-full bg-surface-container px-2 py-0.5 text-xs text-on-surface-variant">
                        {entry.part.kind === "section"
                          ? "Bloque completo"
                          : entry.part.kind === "group"
                            ? "Grupo de preguntas"
                            : "Pregunta individual"}{" "}
                        · {entry.section.title}
                      </span>
                      {entry.section.minimumAge && (
                        <span className="rounded-full bg-secondary-container px-2 py-0.5 text-xs text-on-secondary-container">
                          Solo {entry.section.minimumAge}+
                        </span>
                      )}
                      {entry.section.sensitive && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-error-container px-2 py-0.5 text-xs text-on-error-container">
                          <Icon>lock</Icon> Sensible
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {entry.questionCount}{" "}
                      {entry.questionCount === 1 ? "pregunta" : "preguntas"}
                    </p>
                    {entry.part.kind === "section" &&
                      entry.section.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-on-surface-variant">
                          {entry.section.description}
                        </p>
                      )}
                  </div>

                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() => movePart(entry.key, -1)}
                      disabled={index === 0}
                      className="grid size-8 place-items-center rounded-full hover:bg-surface-container disabled:opacity-25"
                      aria-label={`Subir ${entry.title}`}
                    >
                      <Icon>arrow_upward</Icon>
                    </button>
                    <button
                      type="button"
                      onClick={() => movePart(entry.key, 1)}
                      disabled={index === selected.length - 1}
                      className="grid size-8 place-items-center rounded-full hover:bg-surface-container disabled:opacity-25"
                      aria-label={`Bajar ${entry.title}`}
                    >
                      <Icon>arrow_downward</Icon>
                    </button>
                    <button
                      type="button"
                      onClick={() => removePart(entry.key)}
                      className="grid size-8 place-items-center rounded-full text-error hover:bg-error-container"
                      aria-label={`Quitar ${entry.title}`}
                    >
                      <Icon>close</Icon>
                    </button>
                  </div>
                </div>
                {entry.part.kind === "section" && (
                  <details className="mt-4 border-t border-outline-variant/60 pt-3">
                    <summary className="cursor-pointer text-sm font-semibold text-primary">
                      Ver {entry.questionCount} preguntas incluidas
                    </summary>
                    <div className="mt-3 space-y-2 text-sm text-on-surface-variant">
                      {entry.section.items.flatMap((item) =>
                        item.kind === "question"
                          ? [
                              <div
                                key={item.id}
                                className="flex items-start justify-between gap-3 rounded-lg bg-surface-container-low p-2"
                              >
                                <span>{item.label}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    update(
                                      "sectionKeys",
                                      removeQuestionFromSection(
                                        template.sectionKeys,
                                        entry.section.key,
                                        item.id,
                                      ),
                                    )
                                  }
                                  className="shrink-0 text-error hover:underline"
                                  aria-label={`Quitar ${item.label}`}
                                >
                                  Quitar
                                </button>
                              </div>,
                            ]
                          : item.fields.map((field) => (
                              <div
                                key={`${item.id}.${field.id}`}
                                className="flex items-start justify-between gap-3 rounded-lg bg-surface-container-low p-2"
                              >
                                <span>
                                  {item.title}: {field.label}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    update(
                                      "sectionKeys",
                                      removeQuestionFromSection(
                                        template.sectionKeys,
                                        entry.section.key,
                                        item.id,
                                        field.id,
                                      ),
                                    )
                                  }
                                  className="shrink-0 text-error hover:underline"
                                  aria-label={`Quitar ${field.label}`}
                                >
                                  Quitar
                                </button>
                              </div>
                            )),
                      )}
                    </div>
                  </details>
                )}
                {entry.part.kind === "group" &&
                  entry.item?.kind === "repeatable" && (
                    <details className="mt-4 border-t border-outline-variant/60 pt-3">
                      <summary className="cursor-pointer text-sm font-semibold text-primary">
                        Ver y ajustar {entry.questionCount} preguntas del grupo
                      </summary>
                      <div className="mt-3 space-y-2">
                        {entry.item.fields
                          .filter(
                            (field) =>
                              entry.part.kind === "group" &&
                              (entry.part.fieldIds === null ||
                                entry.part.fieldIds.includes(field.id)),
                          )
                          .map((field) => (
                            <div
                              key={field.id}
                              className="flex items-start justify-between gap-3 rounded-lg bg-surface-container-low p-2 text-sm"
                            >
                              <span>{field.label}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  update(
                                    "sectionKeys",
                                    removeGroupField(
                                      template.sectionKeys,
                                      entry.section.key,
                                      entry.item!.id,
                                      field.id,
                                    ),
                                  )
                                }
                                className="shrink-0 text-error hover:underline"
                                aria-label={`Quitar ${field.label}`}
                              >
                                Quitar
                              </button>
                            </div>
                          ))}
                      </div>
                    </details>
                  )}
              </article>
            ))}

            {selected.length === 0 && (
              <div className="grid min-h-[410px] place-items-center rounded-xl border-2 border-dashed border-outline-variant p-8 text-center">
                <div>
                  <span
                    className="material-symbols-outlined text-5xl text-outline"
                    aria-hidden="true"
                  >
                    view_agenda
                  </span>
                  <h3 className="mt-3 font-headline-md text-lg">
                    Agrega tu primer bloque o pregunta
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-on-surface-variant">
                    Arrastra bloques o preguntas desde el banco, o usa el botón
                    “+”. Las preguntas se reutilizan desde una sola fuente.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest/95 p-4 shadow-lg backdrop-blur md:px-6">
        <div className="flex items-center gap-3">
          <label htmlFor="template-status" className="font-label-md">
            Estado
          </label>
          <select
            id="template-status"
            value={template.status}
            onChange={(event) =>
              update(
                "status",
                event.target.value as FormTemplateEditorValue["status"],
              )
            }
            className="rounded-lg border border-outline-variant bg-surface px-3 py-2 outline-none focus:border-primary"
          >
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicado</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {message && (
            <p
              aria-live="polite"
              className={`text-sm ${message.type === "error" ? "text-error" : "text-green-700"}`}
            >
              {message.text}
            </p>
          )}
          {template.id && template.slug && (
            <a
              href={`/formularios/${template.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-outline-variant px-4 py-3 font-label-md transition hover:bg-surface-container"
            >
              <Icon>open_in_new</Icon>
              Abrir formulario
            </a>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-label-md text-on-primary shadow-sm transition hover:bg-primary-container disabled:cursor-wait disabled:opacity-60"
          >
            <Icon>{isPending ? "progress_activity" : "save"}</Icon>
            {isPending ? "Guardando…" : "Guardar formulario"}
          </button>
        </div>
      </footer>
    </form>
  );
}
