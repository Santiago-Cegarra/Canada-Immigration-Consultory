"use client";

import {
  useActionState,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { type BookingFormState, startBooking } from "@/modules/citas/actions";
import { type BookingDay, CONSULTATION } from "@/modules/citas/schedule";
import { agendarContent, BOOKING_TIME_ZONES } from "../../content/agendar";
import { FormField } from "../ui/form-field";
import { Icon } from "../ui/icon";
import { MonthCalendar } from "../ui/month-calendar";
import { SlotList } from "../ui/slot-list";

const INITIAL_STATE: BookingFormState = { status: "idle" };

type BookingCheckoutProps = {
  days: readonly BookingDay[];
  /** Precio formateado, p. ej. "$150.00 CAD". */
  price: string;
  /** Resumen de la compra (Server Component), arriba del formulario. */
  summary: React.ReactNode;
  /** Preguntas frecuentes y garantías (Server Component), bajo el calendario. */
  assurances: React.ReactNode;
};

/*
 * Zona horaria del navegador. `useSyncExternalStore` da la zona de la agenda en
 * el servidor y la del visitante en el cliente sin desajustes de hidratación.
 */
const noSubscription = () => () => {};
const readBrowserTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || CONSULTATION.timeZone;
const readServerTimeZone = () => CONSULTATION.timeZone;

function timeZoneLabel(timeZone: string): string {
  const known = BOOKING_TIME_ZONES.find((zone) => zone.id === timeZone);
  const offset =
    new Intl.DateTimeFormat("es", { timeZone, timeZoneName: "shortOffset" })
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value ?? "";
  return `${known?.label ?? timeZone.replace(/_/g, " ")} (${offset})`;
}

function firstAvailableDay(days: readonly BookingDay[]): string | null {
  return (
    days.find((day) => day.slots.some((slot) => slot.available))?.day ??
    days[0]?.day ??
    null
  );
}

/**
 * Reserva de la consulta: calendario y horarios a la izquierda; resumen y
 * datos del cliente a la derecha. El botón final lleva a pagar a Stripe.
 *
 * Client Component por el estado de la selección (día, hora, zona horaria) y
 * por `useActionState`, que muestra los errores devueltos por el servidor.
 */
export function BookingCheckout({
  days,
  price,
  summary,
  assurances,
}: BookingCheckoutProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    startBooking,
    INITIAL_STATE,
  );
  const { header, timeZone, calendar, form } = agendarContent;

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

  // Si el horario elegido se ocupó (p. ej. otra persona lo pagó antes), deja
  // de contar como seleccionado en cuanto llega la disponibilidad nueva.
  const slotStillAvailable = days.some((day) =>
    day.slots.some((slot) => slot.start === selectedSlot && slot.available),
  );
  const activeSlot = slotStillAvailable ? selectedSlot : null;

  // El servidor dice que el horario ya no existe: se pide la disponibilidad nueva.
  const slotRejected =
    state.status === "invalid" && Boolean(state.errors.horario);
  useEffect(() => {
    if (slotRejected) router.refresh();
  }, [slotRejected, state, router]);

  const errors = state.status === "invalid" ? state.errors : {};
  const values = state.status === "idle" ? {} : state.values;

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

  const selectedSlotLabel = activeSlot
    ? new Intl.DateTimeFormat("es-419", {
        timeZone: viewerTimeZone,
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(new Date(activeSlot))
    : null;

  function selectDay(day: string) {
    setSelectedDay(day);
    setSelectedSlot(null);
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
      {/* ---------- Izquierda: fecha y hora ---------- */}
      <div className="flex flex-col gap-6 lg:col-span-7">
        <div className="flex flex-col items-start gap-3">
          <span className="rounded bg-primary/10 px-3 py-1 font-label-md text-caption tracking-wider text-primary uppercase">
            {header.eyebrow}
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            {header.title}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {header.description}
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-surface-container bg-surface-container-lowest p-4 sm:flex-row sm:items-center sm:justify-between">
          <label
            htmlFor="zona-horaria"
            className="flex items-center gap-2 font-label-md text-label-md text-on-surface"
          >
            <Icon name="schedule" className="text-[20px] text-primary" />
            {timeZone.label}
          </label>
          <select
            id="zona-horaria"
            value={viewerTimeZone}
            onChange={(event) => setChosenTimeZone(event.target.value)}
            aria-describedby="zona-horaria-ayuda"
            className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          >
            {timeZoneOptions.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {timeZoneLabel(zone.id)}
              </option>
            ))}
          </select>
          <p id="zona-horaria-ayuda" className="sr-only">
            {timeZone.hint}
          </p>
        </div>

        <section className="flex flex-col gap-5 rounded-xl border border-surface-container bg-surface-container-lowest p-5">
          <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3">
            <Icon
              name="event_available"
              className="shrink-0 text-[20px] text-primary"
            />
            <p className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-label-md text-caption tracking-wide text-primary uppercase">
                {calendar.banner}
              </span>
              <span className="font-caption text-caption text-on-surface-variant">
                {calendar.bannerDetail}
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
                  consultationWeekdays={CONSULTATION.weekdays}
                  selectedDay={selectedDay}
                  onSelectDay={selectDay}
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
                    selectedSlot={activeSlot}
                    onSelectSlot={setSelectedSlot}
                    labels={calendar}
                  />
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ---------- Columna derecha: resumen, datos y pago ---------- */}
      <div className="flex flex-col gap-6 rounded-xl border border-surface-container bg-surface-container-lowest p-6 lg:sticky lg:top-24 lg:col-span-5 lg:row-span-2">
        {summary}

        <form
          action={formAction}
          className="flex flex-col gap-5 border-t border-surface-container pt-6"
        >
          <h2 className="font-label-md text-label-md tracking-wider text-on-surface uppercase">
            {form.title}
          </h2>

          <input type="hidden" name="horario" value={activeSlot ?? ""} />
          <div
            className="flex items-start gap-3 rounded-lg bg-surface-container-low p-4"
            aria-live="polite"
          >
            <Icon
              name={activeSlot ? "event_available" : "calendar_month"}
              className="mt-0.5 shrink-0 text-[20px] text-primary"
            />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface">
                {form.slotLabel}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant first-letter:uppercase">
                {selectedSlotLabel ?? form.slotMissing}
              </span>
              {errors.horario && (
                <span
                  role="alert"
                  className="mt-1 font-caption text-caption text-error"
                >
                  {errors.horario}
                </span>
              )}
            </div>
          </div>

          <FormField
            idPrefix="reserva"
            name="nombre"
            label={form.nameLabel}
            error={errors.nombre}
            defaultValue={values.nombre}
          >
            {(props) => (
              <input {...props} type="text" autoComplete="name" required />
            )}
          </FormField>

          <FormField
            idPrefix="reserva"
            name="email"
            label={form.emailLabel}
            hint={form.emailHint}
            error={errors.email}
            defaultValue={values.email}
          >
            {(props) => (
              <input {...props} type="email" autoComplete="email" required />
            )}
          </FormField>

          <FormField
            idPrefix="reserva"
            name="telefono"
            label={form.phoneLabel}
            error={errors.telefono}
            defaultValue={values.telefono}
          >
            {(props) => (
              <input
                {...props}
                type="tel"
                autoComplete="tel"
                placeholder="+57 300 123 4567"
              />
            )}
          </FormField>

          <div>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="politica"
                value="acepto"
                required
                defaultChecked={values.politica === "acepto"}
                aria-invalid={Boolean(errors.politica)}
                aria-describedby={
                  errors.politica ? "reserva-politica-error" : undefined
                }
                className="mt-1 h-4 w-4 shrink-0 accent-primary"
              />
              <span className="font-body-md text-caption text-on-surface-variant">
                {form.policyLabel}
              </span>
            </label>
            {errors.politica && (
              <p
                id="reserva-politica-error"
                className="mt-1 font-caption text-caption text-error"
              >
                {errors.politica}
              </p>
            )}
          </div>

          {state.status === "error" && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-error/30 bg-error-container p-3 font-body-md text-caption text-on-error-container"
            >
              <Icon name="error" className="shrink-0 text-[18px]" />
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={!activeSlot || pending}
            className="group flex min-h-[56px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-label-md text-label-md text-on-primary transition-all hover:bg-primary-container hover:shadow-[0_4px_20px_rgba(213,43,30,0.3)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-primary disabled:hover:shadow-none"
          >
            <Icon name="lock" className="text-[20px]" />
            {pending ? form.pendingLabel : `${form.submitLabel} · ${price}`}
            {!pending && (
              <Icon
                name="arrow_forward"
                className="text-[20px] transition-transform group-hover:translate-x-1"
              />
            )}
          </button>

          <div className="flex flex-col gap-2 border-t border-surface-container pt-4 text-center">
            <p className="flex items-center justify-center gap-1.5 font-caption text-caption text-on-surface">
              <Icon name="credit_card" className="text-[16px] text-primary" />
              {form.redirectNote}
            </p>
            <p className="font-caption text-caption text-on-surface-variant">
              {form.securityNote}
            </p>
          </div>
        </form>
      </div>

      {/* Tras el pago en móvil; bajo el calendario en escritorio. */}
      <div className="lg:col-span-7">{assurances}</div>
    </div>
  );
}
