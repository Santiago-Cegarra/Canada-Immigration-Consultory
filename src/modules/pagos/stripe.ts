import Stripe from "stripe";

/*
 * Cliente de Stripe compartido. Devuelve `null` mientras la clave sea la de
 * ejemplo de `.env.example`: así la web funciona sin pagos configurados y las
 * reservas muestran un aviso en lugar de fallar con un error opaco.
 */

let client: Stripe | null = null;

function isPlaceholder(value: string | undefined): boolean {
  return !value || value.includes("...");
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (isPlaceholder(key)) return null;
  client ??= new Stripe(key as string);
  return client;
}


export function getWebhookSecret(): string | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  return isPlaceholder(secret) ? null : (secret as string);
}
