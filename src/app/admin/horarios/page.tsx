import { requireAdmin } from "@/modules/auth/guards";
import { listProfessionalsWithSchedule } from "@/modules/citas/admin-actions";
import { ProfessionalScheduleEditor } from "@/modules/citas/components/professional-schedule-editor";

export default async function AdminHorariosPage() {
  await requireAdmin();
  const professionals = await listProfessionalsWithSchedule();

  return (
    <div>
      <p className="font-label-md text-primary">AGENDA Y DISPONIBILIDAD</p>
      <h1 className="mt-2 font-headline-lg text-3xl">
        Horarios por profesional
      </h1>
      <p className="mt-2 max-w-3xl text-on-surface-variant">
        Configura los días, horas de inicio y zona horaria de referencia de cada
        consultor o abogado. Los clientes verán estos horarios reflejados en su
        propia zona horaria desde la página pública de agendamiento.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {professionals.map((professional) => (
          <ProfessionalScheduleEditor
            key={professional.id}
            professional={professional}
          />
        ))}
      </div>
    </div>
  );
}
