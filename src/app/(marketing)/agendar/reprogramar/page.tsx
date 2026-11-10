import type { Metadata } from "next";
import { connection } from "next/server";
import { findAppointmentByRescheduleToken } from "@/modules/citas/appointments";
import { RescheduleForm } from "@/modules/citas/components/reschedule-form";
import { ButtonLink } from "@/modules/marketing/components/ui/button-link";
import { Container } from "@/modules/marketing/components/ui/container";
import { Icon } from "@/modules/marketing/components/ui/icon";

export const metadata: Metadata = {
  title: "Reprogramar consulta",
  robots: { index: false },
};

export default async function RescheduleAppointmentPage({
  searchParams,
}: PageProps<"/agendar/reprogramar">) {
  await connection();
  const { token: tokenParam } = await searchParams;
  const token = typeof tokenParam === "string" ? tokenParam.trim() : "";

  const appointment = token
    ? await findAppointmentByRescheduleToken(token, new Date())
    : null;

  if (!appointment) {
    return (
      <section className="w-full py-16 lg:py-24">
        <Container className="flex justify-center">
          <div className="flex w-full max-w-xl flex-col items-start gap-5 rounded-2xl border border-surface-container bg-surface-container-lowest p-8 md:p-10">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon name="event_busy" className="text-[28px]" />
            </span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Enlace de reprogramación no válido
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              No encontramos una consulta confirmada asociada a este enlace.
              Verifica el enlace de tu correo de confirmación o escríbenos desde
              la página de contacto.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <ButtonLink
                action={{ label: "Agendar una consulta", href: "/agendar" }}
                size="md"
              />
              <ButtonLink
                action={{ label: "Ir a contacto", href: "/contacto" }}
                variant="secondary"
                size="md"
              />
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="w-full py-10 lg:py-14">
      <Container>
        <RescheduleForm
          token={token}
          clientName={appointment.clientName}
          currentStartIso={appointment.startTime.toISOString()}
          canReschedule={appointment.canReschedule}
          professional={appointment.professional}
          days={appointment.days}
        />
      </Container>
    </section>
  );
}
