import { cn } from "@/lib/cn";
import type { ProcessStep as ProcessStepData } from "../../types";

type ProcessStepProps = ProcessStepData & {
  /** Número que se muestra en el marcador (1, 2, 3…). */
  position: number;
  /** Resalta el paso en la línea de tiempo. */
  highlighted?: boolean;
};

/** Un paso de la línea de tiempo del proceso. */
export function ProcessStep({
  title,
  description,
  position,
  highlighted = false,
}: ProcessStepProps) {
  return (
    <div className="relative pl-8">
      <div
        className={cn(
          "absolute top-0 -left-[17px] flex h-8 w-8 items-center justify-center rounded-full font-label-md text-label-md",
          highlighted
            ? "border-2 border-primary bg-surface-container-lowest text-primary"
            : "bg-surface-container text-on-surface-variant",
        )}
      >
        {position}
      </div>
      <h4 className="mt-1 mb-2 font-headline-md text-headline-md text-on-surface">
        {title}
      </h4>
      <p className="font-body-md text-body-md text-on-surface-variant">
        {description}
      </p>
    </div>
  );
}
