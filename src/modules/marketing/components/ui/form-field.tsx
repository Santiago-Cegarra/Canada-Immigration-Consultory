/** Estilo común de los campos de texto, selects y textareas de los formularios. */
export const INPUT_CLASSES =
  "w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface transition-colors placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none aria-invalid:border-error";

export type FieldControlProps<TName extends string> = {
  id: string;
  name: TName;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
  className: string;
  defaultValue?: string;
};

type FormFieldProps<TName extends string> = {
  /** Prefijo de los `id`, para que dos formularios en una página no choquen. */
  idPrefix: string;
  name: TName;
  label: string;
  error?: string;
  /** Texto de ayuda bajo el campo; se oculta mientras hay un error. */
  hint?: string;
  className?: string;
  /** Valor con el que se rellena el campo tras un error de validación. */
  defaultValue?: string;
  children: (props: FieldControlProps<TName>) => React.ReactNode;
};

/**
 * Etiqueta + control + mensaje (error o ayuda), conectados por `id` para que
 * los lectores de pantalla anuncien el error junto al campo.
 */
export function FormField<TName extends string>({
  idPrefix,
  name,
  label,
  error,
  hint,
  className,
  defaultValue,
  children,
}: FormFieldProps<TName>) {
  const id = `${idPrefix}-${name}`;
  const messageId = `${id}-message`;
  const message = error ?? hint;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-2 block font-label-md text-label-md text-on-surface"
      >
        {label}
      </label>
      {children({
        id,
        name,
        "aria-invalid": Boolean(error),
        "aria-describedby": message ? messageId : undefined,
        className: INPUT_CLASSES,
        defaultValue,
      })}
      {message && (
        <p
          id={messageId}
          className={
            error
              ? "mt-1 font-caption text-caption text-error"
              : "mt-1 font-caption text-caption text-on-surface-variant"
          }
        >
          {message}
        </p>
      )}
    </div>
  );
}
