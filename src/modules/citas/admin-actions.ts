"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/modules/auth/guards";
import {
  RescheduleNotAllowedError,
  rescheduleAppointment,
  SlotUnavailableError,
} from "./appointments";
import { decryptRescheduleToken } from "./reschedule-crypto";
import { CONSULTATION, zonedTimeToUtc } from "./schedule";

export async function listAdminAppointments() {
  await requireAdmin();

  const appointments = await db.appointment.findMany({
    orderBy: { startTime: "desc" },
    include: {
      professional: {
        select: {
          id: true,
          name: true,
          email: true,
          schedule: { select: { timeZone: true, title: true } },
        },
      },
    },
  });

  return appointments.map((apt) => {
    let rescheduleToken: string | null = null;
    if (apt.rescheduleTokenEncrypted) {
      try {
        rescheduleToken = decryptRescheduleToken(apt.rescheduleTokenEncrypted);
      } catch {
        rescheduleToken = null;
      }
    }
    return {
      id: apt.id,
      clientName: apt.clientName,
      clientEmail: apt.clientEmail,
      clientPhone: apt.clientPhone,
      startTime: apt.startTime,
      endTime: apt.endTime,
      paymentStatus: apt.paymentStatus,
      rescheduledCount: apt.rescheduledCount,
      lastRescheduledAt: apt.lastRescheduledAt,
      meetingUrl: apt.meetingUrl,
      rescheduleToken,
      professional: {
        id: apt.professional.id,
        name: apt.professional.name ?? apt.professional.email,
        timeZone: apt.professional.schedule?.timeZone ?? CONSULTATION.timeZone,
      },
    };
  });
}

export async function listProfessionalsWithSchedule() {
  await requireAdmin();

  const users = await db.user.findMany({
    where: { role: { in: ["PROFESSIONAL", "ADMIN"] } },
    orderBy: [{ role: "desc" }, { name: "asc" }, { email: "asc" }],
    include: { schedule: true },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name ?? u.email,
    email: u.email,
    role: u.role,
    schedule: {
      title: u.schedule?.title ?? "Consultor migratorio regulado (RCIC)",
      timeZone: u.schedule?.timeZone ?? CONSULTATION.timeZone,
      weekdays: u.schedule?.weekdays ?? [...CONSULTATION.weekdays],
      startTimes: u.schedule?.startTimes ?? [...CONSULTATION.startTimes],
      active: u.schedule?.active ?? true,
    },
  }));
}

export type AdminScheduleActionState =
  | { status: "idle" }
  | { status: "saved"; message: string }
  | { status: "error"; message: string };

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function saveProfessionalScheduleAction(
  _prev: AdminScheduleActionState,
  formData: FormData,
): Promise<AdminScheduleActionState> {
  await requireAdmin();

  const professionalId = String(formData.get("professionalId") ?? "").trim();
  const title =
    String(formData.get("title") ?? "").trim() ||
    "Consultor migratorio regulado (RCIC)";
  const timeZone =
    String(formData.get("timeZone") ?? "").trim() || CONSULTATION.timeZone;
  const active = formData.get("active") === "on";

  const weekdays = formData
    .getAll("weekdays")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);

  const rawStartTimes = String(formData.get("startTimes") ?? "");
  const startTimes = [
    ...new Set(
      rawStartTimes
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ].sort();

  if (!professionalId) {
    return { status: "error", message: "Profesional no válido." };
  }

  if (weekdays.length === 0) {
    return {
      status: "error",
      message: "Selecciona al menos un día de la semana.",
    };
  }

  if (
    startTimes.length === 0 ||
    !startTimes.every((t) => TIME_PATTERN.test(t))
  ) {
    return {
      status: "error",
      message:
        "Escribe horas válidas en formato 24h HH:mm separadas por coma (ej. 09:30, 11:15, 14:30).",
    };
  }

  await db.professionalSchedule.upsert({
    where: { professionalId },
    update: { title, timeZone, weekdays, startTimes, active },
    create: { professionalId, title, timeZone, weekdays, startTimes, active },
  });

  revalidatePath("/agendar");
  revalidatePath("/admin/horarios");
  revalidatePath("/admin/citas");

  return { status: "saved", message: "Horario guardado correctamente." };
}

export async function adminRescheduleAppointmentAction(formData: FormData) {
  await requireAdmin();

  const appointmentId = String(formData.get("appointmentId") ?? "").trim();
  const day = String(formData.get("day") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const timeZone =
    String(formData.get("timeZone") ?? "").trim() || CONSULTATION.timeZone;

  if (!appointmentId || !day || !time) return;

  const newStart = zonedTimeToUtc(day, time, timeZone);

  try {
    await rescheduleAppointment({
      appointmentId,
      newStart,
      now: new Date(),
      byAdmin: true,
    });
  } catch (error) {
    if (
      error instanceof SlotUnavailableError ||
      error instanceof RescheduleNotAllowedError
    ) {
      // No romper la recarga; se revalida la vista
    }
  }

  revalidatePath("/admin/citas");
  revalidatePath("/agendar");
}

export async function adminUpdateMeetingUrlAction(formData: FormData) {
  await requireAdmin();

  const appointmentId = String(formData.get("appointmentId") ?? "").trim();
  const meetingUrl = String(formData.get("meetingUrl") ?? "").trim() || null;

  if (!appointmentId) return;

  await db.appointment.update({
    where: { id: appointmentId },
    data: { meetingUrl },
  });

  revalidatePath("/admin/citas");
}
