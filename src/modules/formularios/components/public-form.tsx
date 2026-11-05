"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { saveFormSubmission } from "../submission-actions";
import {
  countSectionQuestions,
  type QuestionDefinition,
  type SectionDefinition,
  type VisibilityRule,
} from "../sections";

type AnswerMap = Record<string, string>;
type RepeatCountMap = Record<string, number>;

function ageFromBirthDate(value: string | undefined): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return null;
  const birthDate = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(birthDate.getTime())) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - birthDate.getUTCFullYear();
  if (
    now.getUTCMonth() < birthDate.getUTCMonth() ||
    (now.getUTCMonth() === birthDate.getUTCMonth() &&
      now.getUTCDate() < birthDate.getUTCDate())
  ) {
    age -= 1;
  }
  return age;
}

function Icon({ children }: { children: string }) {
  return (
    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
      {children}
    </span>
  );
}

function matchesRule(
  rule: VisibilityRule | undefined,
  sectionKey: string,
  answers: AnswerMap,
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
    if (typeof equals === "boolean") {
      return answer === (equals ? "yes" : "no");
    }
    return answer === equals;
  };

  return "anyOf" in rule ? rule.anyOf.some(matches) : matches(rule);
}

const INPUT_CLASSES =
  "w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

function QuestionControl({
  question,
  name,
  value,
  onChange,
}: {
  question: QuestionDefinition;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  if (question.input === "yes-no") {
    return (
      <fieldset>
        <legend className="font-label-md text-on-surface">
          {question.label}
          {question.required && <span className="ml-1 text-primary">*</span>}
        </legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {[
            ["yes", "Sí"],
            ["no", "No"],
          ].map(([optionValue, label]) => (
            <label
              key={optionValue}
              className={`flex min-w-28 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                value === optionValue
                  ? "border-primary bg-primary-fixed text-on-primary-fixed-variant"
                  : "border-outline-variant bg-surface-container-lowest hover:border-outline"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={optionValue}
                checked={value === optionValue}
                onChange={() => onChange(optionValue)}
                required={question.required}
                className="accent-primary"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <label className="block">
      <span className="mb-2 block font-label-md text-on-surface">
        {question.label}
        {question.required && <span className="ml-1 text-primary">*</span>}
      </span>
      {question.input === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={question.required}
          rows={4}
          className={`${INPUT_CLASSES} resize-y`}
        />
      ) : question.input === "select" ? (
        <select
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={question.required}
          className={INPUT_CLASSES}
        >
          <option value="">Selecciona una opción</option>
          {question.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={question.input === "phone" ? "tel" : question.input}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={question.required}
          className={INPUT_CLASSES}
        />
      )}
      {question.helpText && (
        <span className="mt-1 block text-sm text-on-surface-variant">
          {question.helpText}
        </span>
      )}
    </label>
  );
}

export function PublicForm({
  sections,
  isDraft,
  slug,
}: {
  sections: readonly SectionDefinition[];
  isDraft: boolean;
  slug: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [repeatCounts, setRepeatCounts] = useState<RepeatCountMap>({});
  const [submissionState, setSubmissionState] = useState<
    { type: "success" | "error"; message: string } | undefined
  >();
  const [isSaving, startSaving] = useTransition();

  const visibleSections = useMemo(() => {
    const age = ageFromBirthDate(answers["personal-data.birthDate"]);
    return age === null
      ? sections
      : sections.filter(
          (section) => !section.minimumAge || age >= section.minimumAge,
        );
  }, [answers, sections]);
  const currentSection = visibleSections[currentIndex];
  const progress = ((currentIndex + 1) / visibleSections.length) * 100;
  const totalQuestions = useMemo(
    () =>
      visibleSections.reduce(
        (total, section) => total + countSectionQuestions(section),
        0,
      ),
    [visibleSections],
  );

  useEffect(() => {
    if (currentIndex >= visibleSections.length) {
      setCurrentIndex(Math.max(0, visibleSections.length - 1));
    }
  }, [currentIndex, visibleSections.length]);

  if (!currentSection) return null;

  function setAnswer(name: string, value: string) {
    setAnswers((current) => ({ ...current, [name]: value }));
    setSubmissionState(undefined);
  }

  function nextStep() {
    const form = document.getElementById("generated-form") as HTMLFormElement;
    if (!form.reportValidity()) return;
    setCurrentIndex((index) => Math.min(index + 1, visibleSections.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <form
      id="generated-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (currentIndex < visibleSections.length - 1) {
          nextStep();
        } else {
          startSaving(async () => {
            const result = await saveFormSubmission(slug, answers);
            setSubmissionState(
              result.ok
                ? {
                    type: "success",
                    message:
                      "Tus respuestas fueron guardadas correctamente. El equipo ya puede ver este envío.",
                  }
                : { type: "error", message: result.message },
            );
          });
        }
      }}
    >
      <div className="mb-6 rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="font-label-md text-primary">
            Sección {currentIndex + 1} de {visibleSections.length}
          </span>
          <span className="text-on-surface-variant">
            {totalQuestions} preguntas base
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <section className="rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-outline-variant/60 pb-5">
          <div>
            <p className="font-label-md text-primary">
              BLOQUE {currentSection.number}
            </p>
            <h2 className="mt-1 font-headline-lg text-2xl">
              {currentSection.title}
            </h2>
            {currentSection.description && (
              <p className="mt-2 max-w-3xl text-sm text-on-surface-variant">
                {currentSection.description}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {currentSection.minimumAge && (
              <span className="rounded-full bg-secondary-container px-3 py-1 text-xs text-on-secondary-container">
                Solo {currentSection.minimumAge}+
              </span>
            )}
            {currentSection.sensitive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-error-container px-3 py-1 text-xs text-on-error-container">
                <Icon>lock</Icon> Información sensible
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {currentSection.items.map((item) => {
            if (!matchesRule(item.visibleWhen, currentSection.key, answers)) {
              return null;
            }

            if (item.kind === "question") {
              const name = `${currentSection.key}.${item.id}`;
              return (
                <div
                  key={item.id}
                  className={item.input === "textarea" ? "md:col-span-2" : ""}
                >
                  <QuestionControl
                    question={item}
                    name={name}
                    value={answers[name] ?? ""}
                    onChange={(value) => setAnswer(name, value)}
                  />
                </div>
              );
            }

            const groupKey = `${currentSection.key}.${item.id}`;
            const count = repeatCounts[groupKey] ?? item.minimumItems ?? 1;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-outline-variant/70 bg-surface p-4 md:col-span-2 md:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-headline-md text-lg">{item.title}</h3>
                    {item.description && (
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setRepeatCounts((current) => ({
                        ...current,
                        [groupKey]: count + 1,
                      }))
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary hover:bg-primary-fixed"
                  >
                    <Icon>add</Icon> Agregar otro
                  </button>
                </div>

                <div className="mt-5 space-y-5">
                  {Array.from({ length: count }, (_, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="font-label-md">
                          {item.title} {index + 1}
                        </p>
                        {count > (item.minimumItems ?? 1) && (
                          <button
                            type="button"
                            onClick={() =>
                              setRepeatCounts((current) => ({
                                ...current,
                                [groupKey]: count - 1,
                              }))
                            }
                            className="inline-flex items-center gap-1 text-sm text-error"
                          >
                            <Icon>delete</Icon> Quitar
                          </button>
                        )}
                      </div>
                      <div className="grid gap-5 md:grid-cols-2">
                        {item.fields.map((field) => {
                          const name = `${groupKey}.${index}.${field.id}`;
                          return (
                            <div
                              key={field.id}
                              className={
                                field.input === "textarea"
                                  ? "md:col-span-2"
                                  : ""
                              }
                            >
                              <QuestionControl
                                question={field}
                                name={name}
                                value={answers[name] ?? ""}
                                onChange={(value) => setAnswer(name, value)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {submissionState && (
        <div
          className={`mt-5 rounded-xl border p-4 ${
            submissionState.type === "success"
              ? "border-green-300 bg-green-50 text-green-900"
              : "border-error/30 bg-error-container text-on-error-container"
          }`}
          role={submissionState.type === "error" ? "alert" : "status"}
        >
          <p className="font-semibold">
            {submissionState.type === "success"
              ? "Formulario enviado"
              : "No se pudo guardar"}
          </p>
          <p className="mt-1 text-sm">{submissionState.message}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => {
            setCurrentIndex((index) => Math.max(0, index - 1));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-5 py-3 font-label-md transition hover:bg-surface-container disabled:opacity-40"
        >
          <Icon>arrow_back</Icon> Anterior
        </button>

        {isDraft && (
          <span className="rounded-full bg-secondary-container px-3 py-1 text-xs text-on-secondary-container">
            Vista previa de borrador
          </span>
        )}

        <button
          type="submit"
          disabled={isSaving || submissionState?.type === "success"}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-label-md text-on-primary transition hover:bg-primary-container disabled:opacity-60"
        >
          {isSaving
            ? "Guardando…"
            : currentIndex === visibleSections.length - 1
              ? "Enviar formulario"
              : "Siguiente"}
          <Icon>
            {isSaving
              ? "progress_activity"
              : currentIndex === visibleSections.length - 1
                ? "send"
                : "arrow_forward"}
          </Icon>
        </button>
      </div>
    </form>
  );
}
