import { cn } from "@/lib/cn";
import { weekdayOf } from "@/modules/citas/schedule";
import { Icon } from "./icon";

const WEEKDAY_LABELS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"] as const;

type DayState = "available" | "full";

type MonthCalendarProps = {
  /** Mes mostrado, `AAAA-MM`. */
  month: string;
  /** Días con consulta del mes y si les queda algún horario libre. */
  days: ReadonlyMap<string, DayState>;
  /** Días de la semana con consulta (0 = domingo), se resaltan en la cabecera. */
  consultationWeekdays: readonly number[];
  selectedDay: string | null;
  onSelectDay: (day: string) => void;
  onPreviousMonth?: () => void;
  onNextMonth?: () => void;
  labels: {
    previousMonth: string;
    nextMonth: string;
    legendSelected: string;
    legendAvailable: string;
    legendFull: string;
  };
};

const monthTitleFormat = new Intl.DateTimeFormat("es", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const dayLabelFormat = new Intl.DateTimeFormat("es", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Calendario de un mes, con la semana empezando en lunes. Solo los días con
 * consulta son botones; el resto se muestra apagado. No guarda estado: el
 * componente que lo usa decide el mes y el día seleccionados.
 */
export function MonthCalendar({
  month,
  days,
  consultationWeekdays,
  selectedDay,
  onSelectDay,
  onPreviousMonth,
  onNextMonth,
  labels,
}: MonthCalendarProps) {
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  // Huecos antes del día 1 para que la semana empiece en lunes.
  const leadingBlanks = (weekdayOf(`${month}-01`) + 6) % 7;
  const title = capitalize(
    monthTitleFormat.format(new Date(Date.UTC(year, monthNumber - 1, 1))),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-surface-container pb-3">
        <div className="flex items-center gap-2">
          <Icon name="calendar_month" className="text-[20px] text-primary" />
          <h3
            aria-live="polite"
            className="font-label-md text-label-md text-on-surface"
          >
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPreviousMonth}
            disabled={!onPreviousMonth}
            aria-label={labels.previousMonth}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Icon name="chevron_left" className="text-[20px]" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            disabled={!onNextMonth}
            aria-label={labels.nextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Icon name="chevron_right" className="text-[20px]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((label, index) => (
          <span
            key={label}
            aria-hidden
            className={cn(
              "pb-1 font-caption text-caption",
              // `index` es lunes = 0; `consultationWeekdays` usa domingo = 0.
              consultationWeekdays.includes((index + 1) % 7)
                ? "font-semibold text-primary"
                : "text-on-surface-variant",
            )}
          >
            {label}
          </span>
        ))}

        {Array.from({ length: leadingBlanks }, (_, index) => (
          <span key={`blank-${index}`} aria-hidden />
        ))}

        {Array.from({ length: daysInMonth }, (_, index) => {
          const dayNumber = index + 1;
          const day = `${month}-${String(dayNumber).padStart(2, "0")}`;
          const state = days.get(day);

          if (!state) {
            return (
              <span
                key={day}
                aria-hidden
                className="flex h-10 items-center justify-center font-label-md text-label-md text-on-surface-variant/40"
              >
                {dayNumber}
              </span>
            );
          }

          const isSelected = day === selectedDay;
          const isFull = state === "full";
          const description = `${capitalize(dayLabelFormat.format(new Date(`${day}T12:00:00Z`)))}, ${
            isFull ? labels.legendFull : labels.legendAvailable
          }`;

          return (
            <button
              key={day}
              type="button"
              disabled={isFull}
              aria-pressed={isSelected}
              aria-label={description}
              onClick={() => onSelectDay(day)}
              className={cn(
                "relative flex h-10 items-center justify-center rounded-lg font-label-md text-label-md transition-colors",
                isSelected
                  ? "bg-primary text-on-primary"
                  : isFull
                    ? "cursor-not-allowed text-on-surface-variant line-through"
                    : "border border-outline-variant bg-surface-container-low text-on-surface hover:border-primary hover:text-primary",
              )}
            >
              {dayNumber}
              {!isSelected && !isFull && (
                <span
                  aria-hidden
                  className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        aria-hidden
        className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-surface-container pt-3 font-caption text-caption text-on-surface-variant"
      >
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
          {labels.legendSelected}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-outline-variant bg-surface-container-low" />
          {labels.legendAvailable}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-surface-container" />
          {labels.legendFull}
        </span>
      </div>
    </div>
  );
}
