import { Icon } from "../ui/icon";

type BookingSummaryProps = {
  consultantRole: string;
  consultantTag: string;
  firm: string;
  includesTitle: string;
  includes: readonly string[];
  lineLabel: string;
  totalLabel: string;
  totalNote: string;
  /** Precio formateado, p. ej. "$150.00 CAD". */
  price: string;
};

/**
 * Resumen de lo que se compra: quién atiende, qué incluye y cuánto cuesta.
 *
 * El consultor se presenta por su rol, sin nombre ni foto: no se publican
 * hasta que la firma confirme quién atiende (PRODUCT.md).
 */
export function BookingSummary({
  consultantRole,
  consultantTag,
  firm,
  includesTitle,
  includes,
  lineLabel,
  totalLabel,
  totalNote,
  price,
}: BookingSummaryProps) {
  const [amount, currency] = price.split(" ");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 border-b border-surface-container pb-5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface">
          <Icon name="person" className="text-[28px]" />
        </span>
        <div className="flex flex-col">
          <span className="flex items-center gap-2">
            <span className="font-label-md text-label-md text-on-surface">
              {consultantRole}
            </span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 font-label-md text-caption text-primary">
              {consultantTag}
            </span>
          </span>
          <span className="font-caption text-caption text-on-surface-variant">
            {firm}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-label-md text-label-md tracking-wider text-on-surface uppercase">
          {includesTitle}
        </h2>
        <ul className="flex flex-col gap-3">
          {includes.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 font-body-md text-body-md text-on-surface"
            >
              <Icon
                name="check_circle"
                className="mt-0.5 shrink-0 text-[20px] text-primary"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3 rounded-lg bg-surface-container-low p-4">
        <div className="flex justify-between gap-4 font-body-md text-body-md text-on-surface-variant">
          <span>{lineLabel}</span>
          <span className="whitespace-nowrap text-on-surface">{price}</span>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-surface-container pt-3">
          <span className="flex flex-col">
            <span className="font-label-md text-label-md text-on-surface">
              {totalLabel}
            </span>
            <span className="font-caption text-caption text-on-surface-variant">
              {totalNote}
            </span>
          </span>
          <span className="font-headline-lg text-headline-lg whitespace-nowrap text-primary">
            {amount}{" "}
            <span className="font-label-md text-label-md text-on-surface">
              {currency}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
