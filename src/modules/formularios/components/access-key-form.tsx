"use client";

import { useActionState } from "react";
import { unlockForm, type UnlockFormState } from "../access-actions";

const INITIAL_STATE: UnlockFormState = { status: "idle" };

export function AccessKeyForm({
  slug,
  formName,
}: {
  slug: string;
  formName: string;
}) {
  const [state, action, pending] = useActionState(unlockForm, INITIAL_STATE);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-sm md:p-8">
      <span className="grid size-12 place-items-center rounded-xl bg-primary-fixed text-on-primary-fixed-variant">
        <span className="material-symbols-outlined" aria-hidden="true">
          key
        </span>
      </span>
      <p className="mt-5 font-label-md text-primary">ACCESO PROTEGIDO</p>
      <h1 className="mt-2 font-headline-lg text-3xl">{formName}</h1>
      <p className="mt-3 text-on-surface-variant">
        Escribe la clave que te entregó el equipo de Help Immigration Canada.
        Las preguntas no se cargan hasta validar el acceso.
      </p>

      <form action={action} className="mt-6 space-y-4">
        <input type="hidden" name="slug" value={slug} />
        <label className="block">
          <span className="mb-2 block font-label-md">Clave de acceso</span>
          <input
            name="accessKey"
            type="text"
            autoComplete="one-time-code"
            autoCapitalize="characters"
            spellCheck={false}
            required
            placeholder="AB12CD34"
            minLength={8}
            maxLength={64}
            className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 font-mono tracking-wide uppercase transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
          <span className="mt-1 block text-xs text-on-surface-variant">
            Las claves nuevas tienen 8 caracteres.
          </span>
        </label>
        {state.status === "error" && (
          <p className="text-sm text-error" role="alert">
            {state.message}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-label-md text-on-primary transition hover:bg-primary-container disabled:opacity-60"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {pending ? "progress_activity" : "lock_open"}
          </span>
          {pending ? "Verificando…" : "Abrir formulario"}
        </button>
      </form>
    </div>
  );
}
