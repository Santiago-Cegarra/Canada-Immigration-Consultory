import { cn } from "@/lib/cn";
import { Container } from "../ui/container";
import { Icon } from "../ui/icon";

type BookingStepsProps = {
  steps: readonly string[];
  /** Índice del paso actual (0 = primero). */
  current: number;
  seal: { title: string; subtitle: string };
};

/**
 * Franja superior del flujo de reserva: en qué paso está el cliente y el sello
 * de regulación. Los pasos anteriores aparecen completados.
 */
export function BookingSteps({ steps, current, seal }: BookingStepsProps) {
  return (
    <section className="w-full border-b border-surface-container bg-surface-container-low py-5">
      <Container className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <ol className="flex flex-wrap items-center gap-2 sm:gap-3">
          {steps.map((step, index) => {
            const isDone = index < current;
            const isCurrent = index === current;
            return (
              <li
                key={step}
                aria-current={isCurrent ? "step" : undefined}
                className="flex items-center gap-2 sm:gap-3"
              >
                {index > 0 && (
                  <span
                    aria-hidden
                    className={cn(
                      "h-[2px] w-6 sm:w-10",
                      index <= current ? "bg-primary" : "bg-outline-variant",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-label-md text-caption",
                    isCurrent && "bg-primary text-on-primary",
                    isDone && "bg-primary/10 text-primary",
                    !isCurrent &&
                      !isDone &&
                      "bg-surface-container text-on-surface-variant",
                  )}
                >
                  {isDone ? (
                    <Icon name="check" className="text-[16px]" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    "font-label-md text-label-md",
                    isCurrent
                      ? "text-on-surface"
                      : "hidden text-on-surface-variant sm:inline",
                  )}
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="flex items-center gap-3 rounded-lg border border-surface-container bg-surface-container-lowest px-4 py-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon name="verified" className="text-[16px]" />
          </span>
          <span className="flex flex-col">
            <span className="font-label-md text-caption text-on-surface">
              {seal.title}
            </span>
            <span className="font-caption text-caption text-on-surface-variant">
              {seal.subtitle}
            </span>
          </span>
        </div>
      </Container>
    </section>
  );
}
