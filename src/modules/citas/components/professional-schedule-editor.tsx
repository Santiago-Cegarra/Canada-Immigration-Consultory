"use client";

import { useActionState } from "react";
import {
  type AdminScheduleActionState,
  saveProfessionalScheduleAction,
} from "@/modules/citas/admin-actions";
import { BOOKING_TIME_ZONES } from "@/modules/marketing/content/agendar";

const INITIAL_STATE: AdminScheduleActionState = { status: "idle" };

const WEEKDAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
] as const;

type ProfessionalScheduleEditorProps = {
  professional: {
    id: string;
    name: string;
    email: string;
    role: string;
    schedule: {
      title: string;
      timeZone: string;
      weekdays: number[];
      startTimes: string[];
      active: boolean;
    };
  };
};

export function ProfessionalScheduleEditor({
  professional,
}: ProfessionalScheduleEditorProps) {
  const [state, formAction, pending] = useActionState(
    saveProfessionalScheduleAction,
    INITIAL_STATE,
  );
  const { schedule } = professional;

  return (
    <form
      action={formAction}
      className="flex flex-col gap-5 rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-sm"
    >
      <input type="hidden" name="professionalId" value={professional.id} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-container pb-4">
        <div>
          <h2 className="font-headline-md text-xl text-on-surface">
            {professional.name}
          </h2>
          <p className="text-xs text-on-surface-variant">
            {professional.email} · {professional.role}
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-on-surface">
          <input
            type="checkbox"
            name="active"
            defaultChecked={schedule.active}
            className="size-4 accent-primary"
          />
          Agenda activa en /agendar
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-label-md text-on-surface">
            Título / Especialidad pública
          </span>
          <input
            type="text"
            name="title"
            defaultValue={schedule.title}
            placeholder="Consultor migratorio regulado (RCIC)"
            className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-label-md text-on-surface">
            Zona horaria de referencia
          </span>
          <select
            name="timeZone"
            defaultValue={schedule.timeZone}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
          >
            {BOOKING_TIME_ZONES.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.label} ({zone.id})
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-label-md text-sm text-on-surface">
          Días de consulta disponibles
        </legend>
        <div className="mt-1 flex flex-wrap gap-3">
          {WEEKDAYS.map((day) => (
            <label
              key={day.value}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 text-sm text-on-surface"
            >
              <input
                type="checkbox"
                name="weekdays"
                value={day.value}
                defaultChecked={schedule.weekdays.includes(day.value)}
                className="size-4 accent-primary"
              />
              {day.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-label-md text-on-surface">
          Horas de inicio (formato 24h HH:mm, separadas por coma)
        </span>
        <input
          type="text"
          name="startTimes"
          defaultValue={schedule.startTimes.join(", ")}
          placeholder="09:30, 11:15, 14:30, 16:15, 18:00"
          className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
        />
        <span className="text-xs text-on-surface-variant">
          Cada consulta dura 45 minutos y se ofrece en estos horarios dentro de
          la zona horaria elegida arriba.
        </span>
      </label>

      {state.status === "error" && (
        <p className="rounded-lg bg-error-container px-3 py-2 text-xs text-on-error-container">
          {state.message}
        </p>
      )}
      {state.status === "saved" && (
        <p className="rounded-lg bg-green-100 px-3 py-2 text-xs text-green-900">
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-5 py-2.5 font-label-md text-sm text-on-primary transition hover:bg-primary-container disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar horario"}
        </button>
      </div>
    </form>
  );
}
