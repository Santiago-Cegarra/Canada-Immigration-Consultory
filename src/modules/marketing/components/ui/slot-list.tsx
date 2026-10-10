import { cn } from "@/lib/cn";
import { toZonedDay, type Slot } from "@/modules/citas/schedule";
import { Icon } from "./icon";

type SlotListProps = {
  slots: readonly Slot[];
  /** Fecha civil del día en la zona de la agenda, `AAAA-MM-DD`. */
  day: string;
  durationMinutes: number;
  /** Zona en la que el visitante quiere ver las horas. */
  viewerTimeZone: string;
  selectedSlot: string | null;
  onSelectSlot: (start: string) => void;
  labels: {
    slotsPrompt: string;
    available: string;
    taken: string;
    selected: string;
    nextDay: string;
    linkNote: string;
  };
};

const dayTitleFormat = new Intl.DateTimeFormat("es", {
  weekday: "long",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Horarios de un día. Las horas se muestran en la zona del visitante; si esa
 * conversión cae en otro día del calendario (p. ej. Madrid), se avisa.
 */
export function SlotList({
  slots,
  day,
  durationMinutes,
  viewerTimeZone,
  selectedSlot,
  onSelectSlot,
  labels,
}: SlotListProps) {
  const timeFormat = new Intl.DateTimeFormat("es-419", {
    timeZone: viewerTimeZone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-label-md text-label-md text-on-surface">
          {capitalize(dayTitleFormat.format(new Date(`${day}T12:00:00Z`)))}
        </p>
        <span className="flex items-center gap-1 font-caption text-caption text-on-surface-variant">
          <Icon name="videocam" className="text-[16px] text-primary" />
          {durationMinutes} min
        </span>
      </div>
      <p className="font-caption text-caption text-on-surface-variant">
        {labels.slotsPrompt}
      </p>

      <ul className="flex flex-col gap-2">
        {slots.map((slot) => {
          const start = new Date(slot.start);
          const isSelected = slot.start === selectedSlot;
          const shiftsDay = toZonedDay(start, viewerTimeZone) !== day;
          const status = isSelected
            ? labels.selected
            : slot.available
              ? labels.available
              : labels.taken;

          return (
            <li key={slot.start}>
              <button
                type="button"
                disabled={!slot.available}
                aria-pressed={isSelected}
                onClick={() => onSelectSlot(slot.start)}
                className={cn(
                  "flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-4 py-2 text-left transition-colors",
                  isSelected
                    ? "bg-primary text-on-primary"
                    : slot.available
                      ? "bg-surface-container-low text-on-surface hover:bg-surface-container"
                      : "cursor-not-allowed bg-surface-container-low text-on-surface-variant/60 line-through",
                )}
              >
                <span className="font-label-md text-label-md">
                  {timeFormat.format(start)}
                  {shiftsDay && (
                    <span className="ml-1 font-caption text-caption">
                      ({labels.nextDay})
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "font-caption text-caption",
                    isSelected ? "text-on-primary" : "text-on-surface-variant",
                  )}
                >
                  {status}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-auto flex items-center gap-1.5 border-t border-surface-container pt-3 font-caption text-caption text-on-surface-variant">
        <Icon name="link" className="shrink-0 text-[16px] text-primary" />
        {labels.linkNote}
      </p>
    </div>
  );
}
