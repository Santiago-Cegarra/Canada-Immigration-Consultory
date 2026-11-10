"use client";

import { useActionState, useState, useSyncExternalStore } from "react";
import {
  rescheduleByClientAction,
  type RescheduleFormState,
} from "@/modules/citas/actions";
import {
  type BookingDay,
  CONSULTATION,
  formatSlotLong,
  formatWeekdaysBanner,
} from "@/modules/citas/schedule";
import { Icon } from "@/modules/marketing/components/ui/icon";
import { MonthCalendar } from "@/modules/marketing/components/ui/month-calendar";
import { SlotList } from "@/modules/marketing/components/ui/slot-list";
import {
  agendarContent,
  BOOKING_TIME_ZONES,
} from "@/modules/marketing/content/agendar";

const INITIAL_STATE: RescheduleFormState = { status: "idle" };

const noSubscription = () => () => {};
const readBrowserTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || CONSULTATION.timeZone;
const readServerTimeZone = () => CONSULTATION.timeZone;

function firstAvailableDay(days: readonly BookingDay[]): string | null {
  return (
    days.find((day) => day.slots.some((slot) => slot.available))?.day ??
    days[0]?.day ??
    null
  );
}

type RescheduleFormProps = {
  token: string;
  clientName: string;
  currentStartIso: string;
  canReschedule: boolean;
  professional: {
    name: string;
    title: string;
    timeZone: string;
    weekdays: readonly number[];
  };
  days: readonly BookingDay[];
};

export function RescheduleForm({
  token,
  clientName,
  currentStartIso,
  canReschedule,
  professional,
  days,
}: RescheduleFormProps) {
  const [state, formAction, pending] = useActionState(
    rescheduleByClientAction,
    INITIAL_STATE,
  );
  const { calendar, timeZone } = agendarContent;

  const detectedTimeZone = useSyncExternalStore(
    noSubscription,
    readBrowserTimeZone,
    readServerTimeZone,
  );
  const [chosenTimeZone, setChosenTimeZone] = useState<string | null>(null);
  const viewerTimeZone = chosenTimeZone ?? detectedTimeZone;
  const timeZoneOptions = BOOKING_TIME_ZONES.some(
    (zone) => zone.id === viewerTimeZone,
  )
    ? BOOKING_TIME_ZONES
    : [{ id: viewerTimeZone, label: viewerTimeZone }, ...BOOKING_TIME_ZONES];

  const [selectedDay, setSelectedDay] = useState(() => firstAvailableDay(days));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    (selectedDay ?? "").slice(0, 7),
  );

  const effectiveStartIso =
    state.status === "success" ? state.newStartIso : currentStartIso;
  const currentFormatted = formatSlotLong(
    new Date(effectiveStartIso),
    viewerTimeZone,
  );

  const months = [...new Set(days.map(({ day }) => day.slice(0, 7)))];
  const monthIndex = months.indexOf(visibleMonth);
  const monthDays = new Map(
    days
      .filter(({ day }) => day.startsWith(visibleMonth))
      .map(({ day, slots }) => [
        day,
        slots.some((slot) => slot.available)
          ? ("available" as const)
          : ("full" as const),
      ]),
  );
  const daySlots = days.find(({ day }) => day === selectedDay)?.slots ?? [];

  const selectedSlotLabel = selectedSlot
    ? formatSlotLong(new Date(selectedSlot), viewerTimeZone)
    : null;

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
      <div className="flex flex-col gap-6 lg:col-span-7">
        <div className="flex flex-col gap-2">
          <span className="w-fit rounded bg-primary/10 px-3 py-1 font-label-md text-caption tracking-wider text-primary uppercase">
            Gestión de tu consulta
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Reprogramar consulta
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Hola {clientName}, aquí puedes elegir un nuevo horario disponible
            con {professional.name}. Recuerda que las citas no admiten
            cancelación ni reembolso.
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-surface-container bg-surface-container-lowest p-4 sm:flex-row sm:items-center sm:justify-between">
          <label
            htmlFor="reprogramar-zona-horaria"
            className="flex items-center gap-2 font-label-md text-label-md text-on-surface"
          >
            <Icon name="schedule" className="text-[20px] text-primary" />
            {timeZone.label}
          </label>
          <select
            id="reprogramar-zona-horaria"
            value={viewerTimeZone}
            onChange={(event) => setChosenTimeZone(event.target.value)}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none"
          >
            {timeZoneOptions.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.label}
              </option>
            ))}
          </select>
        </div>

        {!canReschedule ? (
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
            <p className="font-label-md text-label-md text-on-surface">
              Plazo de reprogramación cerrado
            </p>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
              Solo es posible reprogramar con al menos{" "}
              {CONSULTATION.minNoticeHours} horas de antelación a tu cita. Si
              tienes una urgencia, contáctanos directamente.
            </p>
          </div>
        ) : (
          <section className="flex flex-col gap-5 rounded-xl border border-surface-container bg-surface-container-lowest p-5">
            <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3">
              <Icon
                name="event_available"
                className="shrink-0 text-[20px] text-primary"
              />
              <p className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="font-label-md text-caption tracking-wide text-primary uppercase">
                  {formatWeekdaysBanner(professional.weekdays)}
                </span>
                <span className="font-caption text-caption text-on-surface-variant">
                  {professional.name} · {professional.title}
                </span>
              </p>
            </div>

            {days.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                {calendar.empty}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-7">
                  <MonthCalendar
                    month={visibleMonth}
                    days={monthDays}
                    consultationWeekdays={professional.weekdays}
                    selectedDay={selectedDay}
                    onSelectDay={(day) => {
                      setSelectedDay(day);
                      setSelectedSlot(null);
                    }}
                    onPreviousMonth={
                      monthIndex > 0
                        ? () => setVisibleMonth(months[monthIndex - 1])
                        : undefined
                    }
                    onNextMonth={
                      monthIndex < months.length - 1
                        ? () => setVisibleMonth(months[monthIndex + 1])
                        : undefined
                    }
                    labels={calendar}
                  />
                </div>
                <div className="border-t border-surface-container pt-5 md:col-span-5 md:border-t-0 md:border-l md:pt-0 md:pl-6">
                  {selectedDay && (
                    <SlotList
                      slots={daySlots}
                      day={selectedDay}
                      durationMinutes={CONSULTATION.durationMinutes}
                      viewerTimeZone={viewerTimeZone}
                      selectedSlot={selectedSlot}
                      onSelectSlot={setSelectedSlot}
                      labels={calendar}
                    />
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      <div className="flex flex-col gap-5 rounded-xl border border-surface-container bg-surface-container-lowest p-6 lg:sticky lg:top-24 lg:col-span-5">
        <div>
          <p className="font-label-md text-caption tracking-wider text-primary uppercase">
            Horario actual confirmado
          </p>
          <p className="mt-1 font-headline-md text-lg text-on-surface first-letter:uppercase">
            {currentFormatted}
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Zona mostrada: {viewerTimeZone}
          </p>
        </div>

        <form
          action={formAction}
          className="flex flex-col gap-4 border-t border-surface-container pt-5"
        >
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="horario" value={selectedSlot ?? ""} />

          <div className="rounded-lg bg-surface-container-low p-4">
            <p className="font-label-md text-label-md text-on-surface">
              Nuevo horario seleccionado
            </p>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant first-letter:uppercase">
              {selectedSlotLabel ??
                "Selecciona un nuevo día y hora en el calendario."}
            </p>
          </div>

          {state.status === "error" && (
            <p
              role="alert"
              className="rounded-lg border border-error/30 bg-error-container p-3 text-sm text-on-error-container"
            >
              {state.message}
            </p>
          )}

          {state.status === "success" && (
            <p
              role="status"
              className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-900"
            >
              ¡Tu cita ha sido reprogramada con éxito! Te hemos enviado un
              correo con el nuevo horario.
            </p>
          )}

          <button
            type="submit"
            disabled={!canReschedule || !selectedSlot || pending}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-label-md text-label-md text-on-primary transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon name="event_available" className="text-[20px]" />
            {pending ? "Reprogramando…" : "Confirmar nuevo horario"}
          </button>
        </form>
      </div>
    </div>
  );
}
