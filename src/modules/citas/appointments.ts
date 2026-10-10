import { db } from "@/lib/db";
import { CONSULTATION, consultationEnd, pendingHoldCutoff } from "./schedule";
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
): Promise<Set<string>> {
  const appointments = await db.appointment.findMany({
    where: { startTime: { gte: from, lte: to }, ...occupiedWhere(now) },
    select: { startTime: true },
  });
  return new Set(appointments.map(({ startTime }) => startTime.toISOString()));
}

/**
 * Profesional que atiende la consulta inicial.
 * TODO: con una sola agenda, se asigna al primer profesional dado de alta.
 * Cuando cada profesional tenga su horario, la reserva deberá elegirlo.
 */
async function findConsultationProfessional(): Promise<string> {
  const professional = await db.user.findFirst({
    where: { role: "PROFESSIONAL" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!professional) throw new NoProfessionalError();
  return professional.id;
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
): Promise<{ id: string }> {
  const professionalId = await findConsultationProfessional();

  try {
    return await db.$transaction(
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
            startTime: request.start,
            endTime: consultationEnd(request.start, CONSULTATION),
          },
          select: { id: true },
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

/** Marca la cita como pagada. Idempotente: Stripe puede repetir un evento. */
export async function markAppointmentPaid(
  appointmentId: string,
): Promise<void> {
  await db.appointment.updateMany({
    where: { id: appointmentId, paymentStatus: { not: "PAID" } },
    data: { paymentStatus: "PAID" },
  });
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
    select: { id: true, startTime: true, paymentStatus: true },
  });
}
