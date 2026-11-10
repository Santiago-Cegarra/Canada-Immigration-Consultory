import Link from "next/link";
import { requireAdmin } from "@/modules/auth/guards";
import {
  adminRescheduleAppointmentAction,
  adminUpdateMeetingUrlAction,
  listAdminAppointments,
} from "@/modules/citas/admin-actions";
import { formatSlotLong, toZonedDay } from "@/modules/citas/schedule";

function statusBadge(status: "PENDING" | "PAID" | "FAILED") {
  if (status === "PAID") {
    return {
      label: "Pagada",
      classes: "bg-green-100 text-green-800",
    };
  }
  if (status === "PENDING") {
    return {
      label: "Pendiente de pago",
      classes: "bg-amber-100 text-amber-800",
    };
  }
  return {
    label: "No completada",
    classes: "bg-surface-container text-on-surface-variant",
  };
}

function toZonedTimeHHmm(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminCitasPage() {
  await requireAdmin();
  const appointments = await listAdminAppointments();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-label-md text-primary">CONSULTAS PROGRAMADAS</p>
          <h1 className="mt-2 font-headline-lg text-3xl">Citas y reservas</h1>
          <p className="mt-2 max-w-3xl text-on-surface-variant">
            Consulta las sesiones agendadas, asigna el enlace de videollamada o
            reprograma cualquier cita pagada (recuerda que la política no admite
            cancelaciones ni reembolsos).
          </p>
        </div>
        <Link
          href="/admin/horarios"
          className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 font-label-md text-sm text-on-surface transition hover:border-primary hover:text-primary"
        >
          <span
            className="material-symbols-outlined text-[18px]"
            aria-hidden="true"
          >
            schedule
          </span>
          Configurar horarios
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center text-on-surface-variant">
          Todavía no se ha registrado ninguna cita.
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-5">
          {appointments.map((apt) => {
            const badge = statusBadge(apt.paymentStatus);
            const tz = apt.professional.timeZone;
            const currentDay = toZonedDay(apt.startTime, tz);
            const currentTime = toZonedTimeHHmm(apt.startTime, tz);

            return (
              <article
                key={apt.id}
                className="flex flex-col gap-4 rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="font-headline-md text-lg text-on-surface">
                        {apt.clientName}
                      </h2>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                      {apt.rescheduledCount > 0 && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          Reprogramada ({apt.rescheduledCount})
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {apt.clientEmail}
                      {apt.clientPhone ? ` · ${apt.clientPhone}` : ""}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="font-label-md text-sm text-on-surface first-letter:uppercase">
                      {formatSlotLong(apt.startTime, tz)}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Profesional: {apt.professional.name} ({tz})
                    </p>
                  </div>
                </div>

                {apt.paymentStatus === "PAID" && (
                  <div className="grid gap-4 border-t border-surface-container pt-4 lg:grid-cols-2">
                    <form
                      action={adminUpdateMeetingUrlAction}
                      className="flex flex-wrap items-end gap-2"
                    >
                      <input
                        type="hidden"
                        name="appointmentId"
                        value={apt.id}
                      />
                      <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-xs">
                        <span className="font-label-md text-on-surface">
                          Enlace de videollamada (Meet / Zoom / Teams)
                        </span>
                        <input
                          type="url"
                          name="meetingUrl"
                          defaultValue={apt.meetingUrl ?? ""}
                          placeholder="https://meet.google.com/..."
                          className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                        />
                      </label>
                      <button
                        type="submit"
                        className="rounded-lg border border-outline-variant bg-surface-container-low px-3.5 py-1.5 text-xs font-semibold text-on-surface transition hover:border-primary hover:text-primary"
                      >
                        Guardar enlace
                      </button>
                    </form>

                    <form
                      action={adminRescheduleAppointmentAction}
                      className="flex flex-wrap items-end gap-2"
                    >
                      <input
                        type="hidden"
                        name="appointmentId"
                        value={apt.id}
                      />
                      <input type="hidden" name="timeZone" value={tz} />
                      <label className="flex flex-col gap-1 text-xs">
                        <span className="font-label-md text-on-surface">
                          Nueva fecha ({tz})
                        </span>
                        <input
                          type="date"
                          name="day"
                          defaultValue={currentDay}
                          required
                          className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs">
                        <span className="font-label-md text-on-surface">
                          Hora
                        </span>
                        <input
                          type="time"
                          name="time"
                          defaultValue={currentTime}
                          required
                          className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                        />
                      </label>
                      <button
                        type="submit"
                        className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-on-primary transition hover:bg-primary-container"
                      >
                        Reprogramar
                      </button>
                    </form>
                  </div>
                )}

                {apt.paymentStatus === "PAID" && apt.rescheduleToken && (
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant">
                    <span>
                      Enlace del cliente para reprogramar:{" "}
                      <Link
                        href={`/agendar/reprogramar?token=${encodeURIComponent(apt.rescheduleToken)}`}
                        className="font-medium text-primary hover:underline"
                      >
                        /agendar/reprogramar?token=···
                      </Link>
                    </span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
