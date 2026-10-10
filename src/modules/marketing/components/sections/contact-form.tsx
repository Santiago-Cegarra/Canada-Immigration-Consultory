"use client";

import { useActionState } from "react";
import {
  type ContactFormState,
  sendContactMessage,
} from "@/modules/contacto/actions";
import { TRAMITES } from "@/modules/contacto/validation";
import { contactoContent } from "../../content/contacto";
import { FormField } from "../ui/form-field";
import { Icon } from "../ui/icon";

const INITIAL_STATE: ContactFormState = { status: "idle" };

/**
 * Formulario de contacto. Es Client Component por `useActionState`, que muestra
 * los errores que devuelve el servidor y el estado de envío. Sin JavaScript el
 * formulario sigue enviándose (mejora progresiva).
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactMessage,
    INITIAL_STATE,
  );
  const { form } = contactoContent;
  const errors = state.status === "invalid" ? state.errors : {};
  const values = state.status === "invalid" ? state.values : {};

  if (state.status === "sent") {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-4 rounded-2xl bg-surface-container-lowest p-8 shadow-sm md:p-10"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Icon name="verified" className="text-[28px] text-primary" />
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">
          {form.successTitle}
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          {form.successMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-sm md:p-10">
      <h2 className="mb-2 font-headline-lg text-headline-lg text-on-surface">
        {form.title}
      </h2>
      <p className="mb-8 font-body-md text-body-md text-on-surface-variant">
        {form.description}
      </p>

      <form
        action={formAction}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2"
      >
        <FormField
          idPrefix="contacto"
          name="nombre"
          defaultValue={values.nombre}
          label="Nombre completo"
          error={errors.nombre}
          className="sm:col-span-2"
        >
          {(props) => (
            <input {...props} type="text" autoComplete="name" required />
          )}
        </FormField>

        <FormField
          idPrefix="contacto"
          name="email"
          defaultValue={values.email}
          label="Correo electrónico"
          error={errors.email}
        >
          {(props) => (
            <input {...props} type="email" autoComplete="email" required />
          )}
        </FormField>

        <FormField
          idPrefix="contacto"
          name="telefono"
          defaultValue={values.telefono}
          label="Teléfono / WhatsApp"
          error={errors.telefono}
        >
          {(props) => (
            <input
              {...props}
              type="tel"
              autoComplete="tel"
              placeholder="+57 300 123 4567"
              required
            />
          )}
        </FormField>

        <FormField
          idPrefix="contacto"
          name="pais"
          defaultValue={values.pais}
          label="País de residencia"
          error={errors.pais}
        >
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="country-name"
              required
            />
          )}
        </FormField>

        <FormField
          idPrefix="contacto"
          name="tramite"
          defaultValue={values.tramite}
          label="Tipo de trámite"
          error={errors.tramite}
        >
          {(props) => (
            // `key`: el reset de React no restaura `defaultValue` en un
            // `<select>`, así que se vuelve a montar con el valor devuelto.
            // `key` va ANTES del spread: detrás de `{...props}` el compilador
            // usa `createElement` y React avisa de una lista sin `key`.
            <select
              key={props.defaultValue}
              {...props}
              defaultValue={props.defaultValue ?? ""}
              required
            >
              <option value="" disabled>
                {form.tramitePlaceholder}
              </option>
              {TRAMITES.map((tramite) => (
                <option key={tramite} value={tramite}>
                  {tramite}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField
          idPrefix="contacto"
          name="mensaje"
          defaultValue={values.mensaje}
          label="Mensaje"
          error={errors.mensaje}
          className="sm:col-span-2"
        >
          {(props) => <textarea {...props} rows={5} required />}
        </FormField>

        <div className="flex flex-col gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="group flex min-h-[56px] items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-label-md text-label-md text-on-primary shadow-sm transition-all hover:bg-primary-container hover:shadow-[0_4px_20px_rgba(213,43,30,0.3)] disabled:cursor-wait disabled:opacity-70 sm:self-start"
          >
            {pending ? form.pendingLabel : form.submitLabel}
            <Icon
              name="send"
              className="text-[20px] transition-transform group-hover:translate-x-1"
            />
          </button>
          <p className="flex items-center gap-2 font-caption text-caption text-on-surface-variant">
            <Icon name="lock" className="text-[16px]" />
            {form.privacyNote}
          </p>
        </div>
      </form>
    </div>
  );
}
