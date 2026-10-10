/**
 * Agenda de la consulta inicial: cuándo se ofrece, cuánto dura y cuánto cuesta.
 *
 * Todo el cálculo es puro (sin base de datos ni `Date.now()` implícito) para
 * poder probarlo con Vitest. Las horas se guardan siempre en UTC; aquí solo se
 * traducen desde la hora local de la firma.
 */

export type ConsultationConfig = {
  durationMinutes: number;
  /** Precio en la unidad mínima de la moneda (centavos). */
  priceCents: number;
  currency: string;
  /**
   * Zona horaria en la que se definen los horarios de la agenda.
   * TODO (CLAUDE.md, decisión abierta): la zona de referencia del horario de
   * cada profesional. Mientras no se decida, toda la agenda usa la de Toronto.
   */
  timeZone: string;
  /** Días de la semana con consulta (0 = domingo … 6 = sábado). */
  weekdays: readonly number[];
  /** Horas de inicio en la zona de la agenda, formato `HH:mm`. */
  startTimes: readonly string[];
  /** Cuántos días hacia delante se puede reservar. */
  bookingHorizonDays: number;
  /** Antelación mínima para reservar, en horas. */
  minNoticeHours: number;
  /**
   * Cuánto tiempo queda apartado un horario mientras el cliente paga. Stripe
   * exige que una sesión de Checkout dure al menos 30 minutos.
   */
  checkoutHoldMinutes: number;
};

/*
 * TODO (confirmar con la firma): precio, duración, día y horarios vienen del
 * diseño. Si cambian, se cambian solo aquí.
 */
export const CONSULTATION: ConsultationConfig = {
  durationMinutes: 45,
  priceCents: 15_000,
  currency: "CAD",
  timeZone: "America/Toronto",
  weekdays: [3],
  startTimes: ["09:30", "11:15", "14:30", "16:15", "18:00"],
  bookingHorizonDays: 60,
  minNoticeHours: 24,
  checkoutHoldMinutes: 31,
};

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

export type Slot = {
  /** Inicio en UTC, formato ISO. */
  start: string;
  available: boolean;
};

export type BookingDay = {
  /** Fecha civil en la zona de la agenda, `AAAA-MM-DD`. */
  day: string;
  slots: Slot[];
};

/** Desfase de `timeZone` respecto a UTC en el instante `date`, en ms. */
function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  const wallClockAsUtc = Date.UTC(
    read("year"),
    read("month") - 1,
    read("day"),
    read("hour"),
    read("minute"),
    read("second"),
  );
  return wallClockAsUtc - (date.getTime() - date.getMilliseconds());
}

/**
 * Instante UTC que corresponde a `day` y `time` en la hora local de
 * `timeZone`. Tiene en cuenta el cambio de horario de verano.
 */
export function zonedTimeToUtc(
  day: string,
  time: string,
  timeZone: string,
): Date {
  const [year, month, date] = day.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const wallClockAsUtc = Date.UTC(year, month - 1, date, hours, minutes);

  // Segunda pasada: junto a un cambio de horario el desfase de la primera
  // aproximación puede no ser el del instante final.
  const firstGuess =
    wallClockAsUtc - timeZoneOffsetMs(new Date(wallClockAsUtc), timeZone);
  return new Date(
    wallClockAsUtc - timeZoneOffsetMs(new Date(firstGuess), timeZone),
  );
}

/** Fecha civil (`AAAA-MM-DD`) de `date` en `timeZone`. */
export function toZonedDay(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Suma días a una fecha civil `AAAA-MM-DD`. */
export function addDays(day: string, amount: number): string {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date + amount))
    .toISOString()
    .slice(0, 10);
}

/** Día de la semana (0 = domingo) de una fecha civil `AAAA-MM-DD`. */
export function weekdayOf(day: string): number {
  return new Date(`${day}T00:00:00Z`).getUTCDay();
}

function earliestBookable(now: Date, config: ConsultationConfig): number {
  return now.getTime() + config.minNoticeHours * HOUR_MS;
}

/**
 * Días con consulta desde hoy hasta el horizonte, con sus horarios. Un horario
 * dentro de la antelación mínima no se ofrece; uno ya reservado se ofrece como
 * no disponible, para que el cliente vea que el día existe pero está ocupado.
 */
export function buildAvailability(
  now: Date,
  takenStarts: ReadonlySet<string>,
  config: ConsultationConfig = CONSULTATION,
): BookingDay[] {
  const earliest = earliestBookable(now, config);
  const today = toZonedDay(now, config.timeZone);
  const days: BookingDay[] = [];

  for (let offset = 0; offset <= config.bookingHorizonDays; offset++) {
    const day = addDays(today, offset);
    if (!config.weekdays.includes(weekdayOf(day))) continue;

    const slots = config.startTimes
      .map((time) => zonedTimeToUtc(day, time, config.timeZone))
      .filter((start) => start.getTime() >= earliest)
      .map((start) => {
        const iso = start.toISOString();
        return { start: iso, available: !takenStarts.has(iso) };
      });

    if (slots.length > 0) days.push({ day, slots });
  }

  return days;
}

/**
 * Comprueba que `start` es un horario que la agenda ofrece de verdad: el día y
 * la hora correctos, con antelación suficiente y dentro del horizonte. Es la
 * defensa del servidor frente a un horario inventado por el cliente.
 */
export function isOfferedSlot(
  start: Date,
  now: Date,
  config: ConsultationConfig = CONSULTATION,
): boolean {
  const time = start.getTime();
  if (Number.isNaN(time)) return false;
  if (time < earliestBookable(now, config)) return false;

  const lastDay = addDays(
    toZonedDay(now, config.timeZone),
    config.bookingHorizonDays,
  );
  const day = toZonedDay(start, config.timeZone);
  if (day > lastDay) return false;
  if (!config.weekdays.includes(weekdayOf(day))) return false;

  return config.startTimes.some(
    (startTime) =>
      zonedTimeToUtc(day, startTime, config.timeZone).getTime() === time,
  );
}

/** Fin de una consulta que empieza en `start`. */
export function consultationEnd(
  start: Date,
  config: ConsultationConfig = CONSULTATION,
): Date {
  return new Date(start.getTime() + config.durationMinutes * MINUTE_MS);
}

/** Instante a partir del cual una reserva pendiente de pago ya no aparta el horario. */
export function pendingHoldCutoff(
  now: Date,
  config: ConsultationConfig = CONSULTATION,
): Date {
  return new Date(now.getTime() - config.checkoutHoldMinutes * MINUTE_MS);
}

/** Precio formateado, p. ej. "$150.00 CAD". */
export function formatPrice(
  cents: number,
  currency: string = CONSULTATION.currency,
): string {
  const amount = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(cents / 100);
  return `${amount} ${currency}`;
}

/** Fecha y hora largas en español, p. ej. "miércoles, 14 de octubre de 2026, 9:30". */
export function formatSlotLong(start: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("es", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(start);
}
