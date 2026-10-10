import { headers } from "next/headers";

/**
 * Origen público del sitio (`https://dominio`), para construir URLs absolutas
 * como las de retorno de Stripe.
 *
 * Usa `APP_URL` si está definida (recomendado en producción). Si no, lo deduce
 * de la petición actual, lo que funciona en desarrollo y detrás de Vercel.
 */
export async function getBaseUrl(): Promise<string> {
  const configured = process.env.APP_URL;
  if (configured) return configured.replace(/\/$/, "");

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
