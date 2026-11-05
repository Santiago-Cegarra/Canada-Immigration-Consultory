"use client";

import { useActionState, useState } from "react";
import { createAccessKey, type CreateAccessKeyState } from "../access-actions";

const INITIAL_STATE: CreateAccessKeyState = { status: "idle" };

type TemplateOption = {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
};

type ProfessionalOption = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "PROFESSIONAL";
};

export function AccessKeyManager({
  templates,
  professionals,
}: {
  templates: TemplateOption[];
  professionals: ProfessionalOption[];
}) {
  const [state, action, pending] = useActionState(
    createAccessKey,
    INITIAL_STATE,
  );
  const [copied, setCopied] = useState(false);

  async function copyKey() {
    if (state.status !== "created") return;
    await navigator.clipboard.writeText(state.accessKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <form
        action={action}
        className="rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm md:p-6"
      >
        <h2 className="font-headline-md text-xl">Generar una clave</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Una misma clave sirve para cualquier visitante que la conozca y puede
          recibir múltiples envíos.
        </p>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block font-label-md">Formulario</span>
            <select
              name="formTemplateId"
              required
              defaultValue=""
              className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 outline-none focus:border-primary"
            >
              <option value="" disabled>
                Selecciona un formulario
              </option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                  {template.status === "DRAFT" ? " (borrador)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block font-label-md">
              Responsable asignado
            </span>
            <select
              name="professionalId"
              required
              defaultValue=""
              disabled={!professionals.length}
              className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 outline-none focus:border-primary disabled:opacity-60"
            >
              <option value="" disabled>
                {professionals.length
                  ? "Selecciona un responsable"
                  : "No hay personal registrado"}
              </option>
              {professionals.map((professional) => (
                <option key={professional.id} value={professional.id}>
                  {professional.name ?? professional.email}
                  {professional.role === "ADMIN" ? " (admin)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block font-label-md">
              Vencimiento en días
            </span>
            <input
              name="expirationDays"
              type="number"
              min={1}
              max={120}
              defaultValue={30}
              required
              className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 outline-none focus:border-primary"
            />
          </label>
        </div>

        {state.status === "error" && (
          <p className="mt-4 text-sm text-error" role="alert">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || !templates.length || !professionals.length}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-label-md text-on-primary transition hover:bg-primary-container disabled:opacity-50"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            key
          </span>
          {pending ? "Generando…" : "Generar clave"}
        </button>
      </form>

      <div className="rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm md:p-6">
        <h2 className="font-headline-md text-xl">Clave para entregar</h2>
        {state.status === "created" ? (
          <div className="mt-5">
            <p className="text-sm text-on-surface-variant">
              Puedes volver a consultarla desde el listado. Compártela solo con
              las personas que deban responder este formulario.
            </p>
            <code className="mt-4 block overflow-x-auto rounded-xl bg-inverse-surface p-4 text-center text-lg font-bold tracking-wider text-inverse-on-surface">
              {state.accessKey}
            </code>
            <button
              type="button"
              onClick={copyKey}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant px-4 py-3 font-label-md hover:bg-surface-container"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                content_copy
              </span>
              {copied ? "Copiada" : "Copiar clave"}
            </button>
            <p className="mt-4 text-sm break-all text-on-surface-variant">
              URL: {state.formUrl}
            </p>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border-2 border-dashed border-outline-variant p-8 text-center text-on-surface-variant">
            La nueva clave aparecerá aquí una sola vez.
          </div>
        )}
      </div>
    </div>
  );
}
