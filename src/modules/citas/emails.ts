import { Resend } from "resend";
import { getBaseUrl } from "@/lib/base-url";
import { CONSULTATION, formatSlotLong } from "./schedule";

let resendClient: Resend | null = null;

function isPlaceholder(value: string | undefined): boolean {
  return !value || value.includes("...") || value === "re_123456789";
}

export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY || process.env.AUTH_RESEND_KEY;
  if (isPlaceholder(key)) return null;
  resendClient ??= new Resend(key as string);
  return resendClient;
}

function getFromEmail(): string {
  return (
    process.env.RESEND_FROM_EMAIL ||
    "Help Immigration Canada <no-reply@helpimmigrationcanada.net>"
  );
}

export type AppointmentEmailDetails = {
  appointmentId: string;
  clientName: string;
  clientEmail: string;
  professionalName: string;
  professionalTitle: string;
  timeZone: string;
  startTime: Date;
  durationMinutes?: number;
  meetingUrl?: string | null;
  /** Trámite por el que se reservó la consulta, si el cliente llegó desde uno. */
  serviceTitle?: string | null;
  rescheduleToken: string;
};

/** Los correos son HTML: un texto con `<` o `&` no debe leerse como marcado. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MAX_RESEND_SCHEDULE_DAYS = 29;

function buildRescheduleUrl(baseUrl: string, token: string): string {
  return `${baseUrl}/agendar/reprogramar?token=${encodeURIComponent(token)}`;
}

function renderEmailShell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1b1b1f;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background-color:#ffffff;border:1px solid #e2e2e6;border-radius:16px;padding:32px;">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#d52b1e;">
                Help Immigration Canada
              </p>
              ${bodyHtml}
              <hr style="border:none;border-top:1px solid #e2e2e6;margin:28px 0 16px;" />
              <p style="margin:0;font-size:12px;line-height:1.5;color:#5e5e62;">
                Política de consultas: las sesiones pueden reprogramarse con al menos ${CONSULTATION.minNoticeHours} horas de antelación. No se realizan cancelaciones ni reembolsos.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendAppointmentConfirmationAndScheduleReminder(
  details: AppointmentEmailDetails,
): Promise<{ sent: boolean; reminderEmailId: string | null }> {
  const resend = getResend();
  if (!resend) return { sent: false, reminderEmailId: null };

  const baseUrl = await getBaseUrl();
  const rescheduleUrl = buildRescheduleUrl(baseUrl, details.rescheduleToken);
  const formattedDate = formatSlotLong(details.startTime, details.timeZone);
  const duration = details.durationMinutes ?? CONSULTATION.durationMinutes;

  const meetingBlock = details.meetingUrl
    ? `<p style="margin:16px 0;"><a href="${details.meetingUrl}" style="display:inline-block;background-color:#1b1b1f;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;font-size:14px;">Entrar a la videollamada</a></p>`
    : `<p style="margin:16px 0;font-size:14px;color:#44474e;">El enlace de la videollamada te será enviado por tu consultor antes de la sesión.</p>`;

  const serviceBlock = details.serviceTitle
    ? `<p style="margin:12px 0 4px;font-size:13px;color:#5e5e62;">Motivo de la consulta</p>
        <p style="margin:0;font-size:15px;font-weight:600;">${escapeHtml(details.serviceTitle)}</p>`
    : "";

  const html = renderEmailShell(
    "Tu consulta migratoria está confirmada",
    `
      <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;">¡Tu consulta está confirmada, ${details.clientName}!</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#44474e;">
        Hemos recibido tu pago y reservado tu sesión individual de ${duration} minutos.
      </p>
      <div style="background-color:#f3f4f6;border-radius:12px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0 0 6px;font-size:13px;color:#5e5e62;">Fecha y hora</p>
        <p style="margin:0 0 12px;font-size:16px;font-weight:600;">${formattedDate} (${details.timeZone})</p>
        <p style="margin:0 0 4px;font-size:13px;color:#5e5e62;">Profesional asignado</p>
        <p style="margin:0;font-size:15px;font-weight:600;">${details.professionalName} · <span style="font-weight:400;color:#5e5e62;">${details.professionalTitle}</span></p>
        ${serviceBlock}
      </div>
      ${meetingBlock}
      <p style="margin:20px 0 8px;font-size:14px;color:#44474e;">
        ¿Necesitas cambiar la fecha u hora de tu cita? Puedes reprogramarla directamente desde el siguiente enlace:
      </p>
      <p style="margin:0;">
        <a href="${rescheduleUrl}" style="color:#d52b1e;font-weight:600;font-size:14px;">Reprogramar mi cita →</a>
      </p>
    `,
  );

  let sent = false;
  try {
    const response = await resend.emails.send({
      from: getFromEmail(),
      to: details.clientEmail,
      subject: `Consulta confirmada: ${formattedDate}`,
      html,
    });
    sent = !response.error;
  } catch {
    sent = false;
  }

  const reminderEmailId = await scheduleAppointmentReminder(details);
  return { sent, reminderEmailId };
}

export async function scheduleAppointmentReminder(
  details: AppointmentEmailDetails,
): Promise<string | null> {
  const resend = getResend();
  if (!resend) return null;

  const now = Date.now();
  const reminderTime = details.startTime.getTime() - DAY_MS;

  // Solo programamos recordatorio si falta más de 1 hora para el envío y está dentro de la ventana de 29 días de Resend
  if (
    reminderTime <= now + HOUR_MS ||
    reminderTime > now + MAX_RESEND_SCHEDULE_DAYS * DAY_MS
  ) {
    return null;
  }

  const baseUrl = await getBaseUrl();
  const rescheduleUrl = buildRescheduleUrl(baseUrl, details.rescheduleToken);
  const formattedDate = formatSlotLong(details.startTime, details.timeZone);
  const duration = details.durationMinutes ?? CONSULTATION.durationMinutes;

  const meetingBlock = details.meetingUrl
    ? `<p style="margin:16px 0;"><a href="${details.meetingUrl}" style="display:inline-block;background-color:#d52b1e;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;font-size:14px;">Unirse a la videollamada</a></p>`
    : "";

  const html = renderEmailShell(
    "Recordatorio de tu consulta migratoria mañana",
    `
      <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">Recordatorio: tu consulta es mañana</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#44474e;">
        Hola ${details.clientName}, te recordamos tu sesión de diagnóstico migratorio (${duration} min).
      </p>
      <div style="background-color:#f3f4f6;border-radius:12px;padding:16px 20px;margin:20px 0;">
        <p style="margin:0 0 6px;font-size:13px;color:#5e5e62;">Fecha y hora</p>
        <p style="margin:0 0 12px;font-size:16px;font-weight:600;">${formattedDate} (${details.timeZone})</p>
        <p style="margin:0 0 4px;font-size:13px;color:#5e5e62;">Profesional</p>
        <p style="margin:0;font-size:15px;font-weight:600;">${details.professionalName}</p>
      </div>
      ${meetingBlock}
      <p style="margin:16px 0 0;font-size:13px;color:#5e5e62;">
        Detalles de tu reserva: <a href="${rescheduleUrl}" style="color:#d52b1e;">Ver cita</a>
      </p>
    `,
  );

  try {
    const response = await resend.emails.send({
      from: getFromEmail(),
      to: details.clientEmail,
      subject: `Recordatorio: Tu consulta migratoria es mañana (${formattedDate})`,
      html,
      scheduledAt: new Date(reminderTime).toISOString(),
    });
    return response.data?.id ?? null;
  } catch {
    return null;
  }
}

export async function cancelScheduledReminder(
  reminderEmailId: string | null | undefined,
): Promise<void> {
  if (!reminderEmailId) return;
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.cancel(reminderEmailId);
  } catch {
    // Si ya se envió o no existe en Resend, ignorar de forma segura.
  }
}

export async function sendAppointmentRescheduledEmail(
  details: AppointmentEmailDetails & { previousStartTime: Date },
): Promise<string | null> {
  const resend = getResend();
  if (resend) {
    const baseUrl = await getBaseUrl();
    const rescheduleUrl = buildRescheduleUrl(baseUrl, details.rescheduleToken);
    const newDate = formatSlotLong(details.startTime, details.timeZone);
    const oldDate = formatSlotLong(details.previousStartTime, details.timeZone);

    const html = renderEmailShell(
      "Tu consulta migratoria ha sido reprogramada",
      `
        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">Cita reprogramada, ${details.clientName}</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#44474e;">
          Hemos actualizado el horario de tu consulta migratoria.
        </p>
        <div style="background-color:#f3f4f6;border-radius:12px;padding:16px 20px;margin:20px 0;">
          <p style="margin:0 0 4px;font-size:13px;color:#5e5e62;">Nuevo horario confirmado</p>
          <p style="margin:0 0 12px;font-size:16px;font-weight:600;color:#1b1b1f;">${newDate} (${details.timeZone})</p>
          <p style="margin:0 0 4px;font-size:13px;color:#5e5e62;">Horario anterior</p>
          <p style="margin:0 0 12px;font-size:14px;text-decoration:line-through;color:#5e5e62;">${oldDate}</p>
          <p style="margin:0 0 4px;font-size:13px;color:#5e5e62;">Profesional</p>
          <p style="margin:0;font-size:15px;font-weight:600;">${details.professionalName}</p>
        </div>
        <p style="margin:16px 0 0;font-size:14px;">
          <a href="${rescheduleUrl}" style="color:#d52b1e;font-weight:600;">Gestionar o reprogramar mi cita →</a>
        </p>
      `,
    );

    try {
      await resend.emails.send({
        from: getFromEmail(),
        to: details.clientEmail,
        subject: `Cita reprogramada: ${newDate}`,
        html,
      });
    } catch {
      // Continuar aunque falle el envío inmediato.
    }
  }

  return scheduleAppointmentReminder(details);
}
