import { db } from "@/lib/db";
import {
  cancelScheduledReminder,
  sendAppointmentConfirmationAndScheduleReminder,
  sendAppointmentRescheduledEmail,
} from "./emails";
import {
  decryptRescheduleToken,
  encryptRescheduleToken,
  generateRescheduleToken,
  hashRescheduleToken,
} from "./reschedule-crypto";
import {
  addDays,
  buildAvailability,
  type BookingDay,
  CONSULTATION,
  type ConsultationConfig,
  consultationEnd,
  isOfferedSlot,
  pendingHoldCutoff,
  toZonedDay,
  withProfessionalSchedule,
  zonedTimeToUtc,
} from "./schedule";
import type { BookingRequest } from "./validation";

/*
 * Acceso a datos de las citas. Solo este archivo sabe cómo se guardan; el resto
 * del sistema usa estas funciones.
 *
 * Un horario está ocupado si tiene una cita pagada, o una pendiente de pago
 * creada hace menos de `checkoutHoldMinutes` (el cliente está en Stripe). Una
 * pendiente más antigua ya no aparta el horario aunque no se haya limpiado.
 */

export class SlotUnavailableError extends Error {
  constructor() {
    super("El horario ya está reservado.");
  }
}

export class NoProfessionalError extends Error {
  constructor() {
    super("No hay ningún profesional configurado para atender consultas.");
  }
}

export class RescheduleNotAllowedError extends Error {
  constructor(message = "Esta cita no se puede reprogramar en este momento.") {
    super(message);
  }
}

export type PublicProfessionalSchedule = {
  professionalId: string;
  name: string;
  title: string;
  timeZone: string;
  weekdays: readonly number[];
  startTimes: readonly string[];
  days: BookingDay[];
};

/** Condición de "este horario está ocupado" para una consulta de Prisma. */
function occupiedWhere(now: Date) {
  return {
    OR: [
      { paymentStatus: "PAID" as const },
      {
        paymentStatus: "PENDING" as const,
        createdAt: { gt: pendingHoldCutoff(now) },
      },
    ],
  };
}

/** Inicios (ISO, UTC) ocupados entre `from` y `to`. */
export async function getTakenStarts(
  from: Date,
  to: Date,
  now: Date = new Date(),
  professionalId?: string,
  excludeAppointmentId?: string,
): Promise<Set<string>> {
  const appointments = await db.appointment.findMany({
    where: {
      ...(professionalId ? { professionalId } : {}),
      ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
      startTime: { gte: from, lte: to },
      ...occupiedWhere(now),
    },
    select: { startTime: true },
  });
  return new Set(appointments.map(({ startTime }) => startTime.toISOString()));
}

/**
 * Obtiene la configuración de horario de un profesional, o la predeterminada si
 * aún no tiene fila en `ProfessionalSchedule`.
 */
export async function getProfessionalConsultationConfig(
  professionalId?: string | null,
): Promise<{
  professionalId: string;
  name: string;
  title: string;
  config: ConsultationConfig;
}> {
  const user = professionalId
    ? await db.user.findFirst({
        where: {
          id: professionalId,
          role: { in: ["PROFESSIONAL", "ADMIN"] },
        },
        include: { schedule: true },
      })
    : await db.user.findFirst({
        where: {
          OR: [
            { schedule: { active: true } },
            { role: { in: ["PROFESSIONAL", "ADMIN"] } },
          ],
        },
        orderBy: [{ role: "desc" }, { createdAt: "asc" }],
        include: { schedule: true },
      });

  if (!user) throw new NoProfessionalError();

  const schedule = user.schedule;
  const config =
    schedule && schedule.active
      ? withProfessionalSchedule(schedule, CONSULTATION)
      : CONSULTATION;

  return {
    professionalId: user.id,
    name: user.name ?? user.email,
    title: schedule?.title ?? "Consultor migratorio regulado (RCIC)",
    config,
  };
}

/**
 * Lista los profesionales activos con su calendario de disponibilidad para `/agendar`.
 */
export async function loadBookableProfessionals(
  now: Date = new Date(),
): Promise<PublicProfessionalSchedule[]> {
  try {
    const users = await db.user.findMany({
      where: {
        role: { in: ["PROFESSIONAL", "ADMIN"] },
        OR: [{ schedule: { is: null } }, { schedule: { active: true } }],
      },
      orderBy: [{ role: "desc" }, { createdAt: "asc" }],
      include: { schedule: true },
    });

    if (users.length === 0) {
      return [
        {
          professionalId: "default",
          name: "Consultor migratorio regulado",
          title: "RCIC",
          timeZone: CONSULTATION.timeZone,
          weekdays: CONSULTATION.weekdays,
          startTimes: CONSULTATION.startTimes,
          days: buildAvailability(now, new Set(), CONSULTATION),
        },
      ];
    }

    return Promise.all(
      users.map(async (user) => {
        const config = user.schedule
          ? withProfessionalSchedule(user.schedule, CONSULTATION)
          : CONSULTATION;
        const lastDay = addDays(
          toZonedDay(now, config.timeZone),
          config.bookingHorizonDays + 1,
        );
        const taken = await getTakenStarts(
          now,
          zonedTimeToUtc(lastDay, "00:00", config.timeZone),
          now,
          user.id,
        );
        return {
          professionalId: user.id,
          name: user.name ?? user.email,
          title: user.schedule?.title ?? "Consultor migratorio regulado (RCIC)",
          timeZone: config.timeZone,
          weekdays: config.weekdays,
          startTimes: config.startTimes,
          days: buildAvailability(now, taken, config),
        };
      }),
    );
  } catch {
    return [
      {
        professionalId: "default",
        name: "Consultor migratorio regulado",
        title: "RCIC",
        timeZone: CONSULTATION.timeZone,
        weekdays: CONSULTATION.weekdays,
        startTimes: CONSULTATION.startTimes,
        days: buildAvailability(now, new Set(), CONSULTATION),
      },
    ];
  }
}

/**
 * Aparta el horario creando una cita pendiente de pago.
 *
 * La comprobación y la inserción van en una transacción serializable: si dos
 * personas eligen el mismo horario a la vez, solo una lo consigue. Postgres
 * aborta la otra con un error de serialización (P2034), que aquí se traduce en
 * "horario ocupado".
 */
export async function reserveSlot(
  request: BookingRequest,
  now: Date = new Date(),
  /** Trámite del catálogo ya verificado por quien llama, si lo hay. */
  service: { slug: string; title: string } | null = null,
): Promise<{ id: string; rescheduleToken: string }> {
  const targetId =
    request.professionalId && request.professionalId !== "default"
      ? request.professionalId
      : null;

  const { professionalId, config } =
    await getProfessionalConsultationConfig(targetId);

  if (!isOfferedSlot(request.start, now, config)) {
    throw new SlotUnavailableError();
  }

  const rescheduleToken = generateRescheduleToken();
  const rescheduleTokenHash = hashRescheduleToken(rescheduleToken);
  const rescheduleTokenEncrypted = encryptRescheduleToken(rescheduleToken);

  try {
    const created = await db.$transaction(
      async (tx) => {
        const conflict = await tx.appointment.findFirst({
          where: {
            professionalId,
            startTime: request.start,
            ...occupiedWhere(now),
          },
          select: { id: true },
        });
        if (conflict) throw new SlotUnavailableError();

        return tx.appointment.create({
          data: {
            professionalId,
            clientName: request.nombre,
            clientEmail: request.email,
            clientPhone: request.telefono,
            serviceSlug: service?.slug ?? null,
            serviceTitle: service?.title ?? null,
            startTime: request.start,
            endTime: consultationEnd(request.start, config),
            rescheduleTokenHash,
            rescheduleTokenEncrypted,
          },
          select: { id: true },
        });
      },
      { isolationLevel: "Serializable" },
    );

    return { id: created.id, rescheduleToken };
  } catch (error) {
    if ((error as { code?: string }).code === "P2034") {
      throw new SlotUnavailableError();
    }
    throw error;
  }
}

export async function attachCheckoutSession(
  appointmentId: string,
  stripeSessionId: string,
): Promise<void> {
  await db.appointment.update({
    where: { id: appointmentId },
    data: { stripeSessionId },
  });
}

function ensureRescheduleToken(appointment: {
  id: string;
  rescheduleTokenEncrypted: string | null;
}): Promise<string> | string {
  if (appointment.rescheduleTokenEncrypted) {
    try {
      return decryptRescheduleToken(appointment.rescheduleTokenEncrypted);
    } catch {
      // Si no se pudo descifrar, generamos uno nuevo abajo.
    }
  }
  const token = generateRescheduleToken();
  return db.appointment
    .update({
      where: { id: appointment.id },
      data: {
        rescheduleTokenHash: hashRescheduleToken(token),
        rescheduleTokenEncrypted: encryptRescheduleToken(token),
      },
    })
    .then(() => token);
}

/**
 * Marca la cita como pagada y envía el correo de confirmación + programa el
 * recordatorio en Resend (idempotente: Stripe y la página de confirmación
 * pueden llamarlo casi a la vez).
 */
export async function markAppointmentPaid(
  appointmentId: string,
): Promise<void> {
  await db.appointment.updateMany({
    where: { id: appointmentId, paymentStatus: { not: "PAID" } },
    data: { paymentStatus: "PAID" },
  });

  const claim = await db.appointment.updateMany({
    where: {
      id: appointmentId,
      paymentStatus: "PAID",
      confirmationEmailSentAt: null,
    },
    data: { confirmationEmailSentAt: new Date() },
  });

  if (claim.count === 0) return;

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      professional: { include: { schedule: true } },
    },
  });
  if (!appointment) return;

  const rescheduleToken = await ensureRescheduleToken(appointment);
  const timeZone =
    appointment.professional.schedule?.timeZone ?? CONSULTATION.timeZone;
  const professionalTitle =
    appointment.professional.schedule?.title ??
    "Consultor migratorio regulado (RCIC)";

  const { reminderEmailId } =
    await sendAppointmentConfirmationAndScheduleReminder({
      appointmentId: appointment.id,
      clientName: appointment.clientName,
      clientEmail: appointment.clientEmail,
      professionalName:
        appointment.professional.name ?? appointment.professional.email,
      professionalTitle,
      timeZone,
      startTime: appointment.startTime,
      meetingUrl: appointment.meetingUrl,
      serviceTitle: appointment.serviceTitle,
      rescheduleToken,
    });

  if (reminderEmailId) {
    await db.appointment.update({
      where: { id: appointment.id },
      data: { reminderEmailId },
    });
  }
}

/** Libera el horario de una cita que no llegó a pagarse. Nunca toca una pagada. */
export async function markAppointmentFailed(
  appointmentId: string,
): Promise<void> {
  await db.appointment.updateMany({
    where: { id: appointmentId, paymentStatus: "PENDING" },
    data: { paymentStatus: "FAILED" },
  });
}

export async function findAppointmentByCheckoutSession(
  stripeSessionId: string,
) {
  return db.appointment.findUnique({
    where: { stripeSessionId },
    select: {
      id: true,
      startTime: true,
      paymentStatus: true,
      rescheduleTokenEncrypted: true,
      professional: {
        select: {
          name: true,
          email: true,
          schedule: { select: { timeZone: true, title: true } },
        },
      },
    },
  });
}

export async function findAppointmentByRescheduleToken(
  rawToken: string,
  now: Date = new Date(),
) {
  const tokenHash = hashRescheduleToken(rawToken);
  const appointment = await db.appointment.findUnique({
    where: { rescheduleTokenHash: tokenHash },
    include: {
      professional: { include: { schedule: true } },
    },
  });

  if (!appointment || appointment.paymentStatus !== "PAID") return null;

  const config = appointment.professional.schedule
    ? withProfessionalSchedule(appointment.professional.schedule, CONSULTATION)
    : CONSULTATION;

  const lastDay = addDays(
    toZonedDay(now, config.timeZone),
    config.bookingHorizonDays + 1,
  );
  const taken = await getTakenStarts(
    now,
    zonedTimeToUtc(lastDay, "00:00", config.timeZone),
    now,
    appointment.professionalId,
    appointment.id,
  );

  const canReschedule =
    appointment.startTime.getTime() - now.getTime() >=
    config.minNoticeHours * 60 * 60 * 1000;

  return {
    id: appointment.id,
    clientName: appointment.clientName,
    clientEmail: appointment.clientEmail,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    meetingUrl: appointment.meetingUrl,
    rescheduledCount: appointment.rescheduledCount,
    canReschedule,
    professional: {
      id: appointment.professional.id,
      name: appointment.professional.name ?? appointment.professional.email,
      title:
        appointment.professional.schedule?.title ??
        "Consultor migratorio regulado (RCIC)",
      timeZone: config.timeZone,
      weekdays: config.weekdays,
      startTimes: config.startTimes,
    },
    days: buildAvailability(now, taken, config),
  };
}

/**
 * Reprograma una cita ya pagada a un nuevo horario disponible.
 * Si `byAdmin` es false, verifica la antelación mínima respecto a la cita actual
 * y que el nuevo horario forme parte de la agenda del profesional.
 */
export async function rescheduleAppointment({
  appointmentId,
  newStart,
  now = new Date(),
  byAdmin = false,
}: {
  appointmentId: string;
  newStart: Date;
  now?: Date;
  byAdmin?: boolean;
}): Promise<void> {
  const existing = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: { professional: { include: { schedule: true } } },
  });

  if (!existing || existing.paymentStatus !== "PAID") {
    throw new RescheduleNotAllowedError("La cita no existe o no está pagada.");
  }

  const config = existing.professional.schedule
    ? withProfessionalSchedule(existing.professional.schedule, CONSULTATION)
    : CONSULTATION;

  if (!byAdmin) {
    const noticeMs = config.minNoticeHours * 60 * 60 * 1000;
    if (existing.startTime.getTime() - now.getTime() < noticeMs) {
      throw new RescheduleNotAllowedError(
        `Solo se puede reprogramar con al menos ${config.minNoticeHours} horas de antelación.`,
      );
    }
    if (!isOfferedSlot(newStart, now, config)) {
      throw new SlotUnavailableError();
    }
  } else if (
    Number.isNaN(newStart.getTime()) ||
    newStart.getTime() <= now.getTime()
  ) {
    throw new RescheduleNotAllowedError("Elige una fecha y hora futuras.");
  }

  if (existing.startTime.getTime() === newStart.getTime()) {
    return;
  }

  try {
    await db.$transaction(
      async (tx) => {
        const conflict = await tx.appointment.findFirst({
          where: {
            id: { not: existing.id },
            professionalId: existing.professionalId,
            startTime: newStart,
            ...occupiedWhere(now),
          },
          select: { id: true },
        });
        if (conflict) throw new SlotUnavailableError();

        await tx.appointment.update({
          where: { id: existing.id },
          data: {
            startTime: newStart,
            endTime: consultationEnd(newStart, config),
            rescheduledCount: { increment: 1 },
            lastRescheduledAt: now,
          },
        });
      },
      { isolationLevel: "Serializable" },
    );
  } catch (error) {
    if ((error as { code?: string }).code === "P2034") {
      throw new SlotUnavailableError();
    }
    throw error;
  }

  await cancelScheduledReminder(existing.reminderEmailId);

  const rescheduleToken = await ensureRescheduleToken(existing);
  const newReminderId = await sendAppointmentRescheduledEmail({
    appointmentId: existing.id,
    clientName: existing.clientName,
    clientEmail: existing.clientEmail,
    professionalName: existing.professional.name ?? existing.professional.email,
    professionalTitle:
      existing.professional.schedule?.title ??
      "Consultor migratorio regulado (RCIC)",
    timeZone: config.timeZone,
    startTime: newStart,
    previousStartTime: existing.startTime,
    meetingUrl: existing.meetingUrl,
    rescheduleToken,
  });

  await db.appointment.update({
    where: { id: existing.id },
    data: { reminderEmailId: newReminderId },
  });
}
