import type { ProcessStep as ProcessStepData } from "../../types";

type ProcessStepProps = ProcessStepData & {
  /** Número que se muestra en el marcador (1, 2, 3…). */
  position: number;
};

/**
 * Un paso de la línea de tiempo del proceso. Todos los marcadores son iguales:
 * resaltar uno sugeriría un "estás aquí" que en una página informativa no existe.
 */
export function ProcessStep({
  title,
  description,
  position,
}: ProcessStepProps) {
  return (
    <div className="relative pl-8">
      <div
        aria-hidden
        className="absolute top-0 -left-[17px] flex h-8 w-8 items-center justify-center rounded-full bg-surface-container font-label-md text-label-md text-on-surface"
      >
        {position}
      </div>
      <h3 className="mt-1 mb-2 font-headline-md text-headline-md text-on-surface">
        {title}
      </h3>
      <p className="font-body-md text-body-md text-on-surface-variant">
        {description}
      </p>
    </div>
  );
}
