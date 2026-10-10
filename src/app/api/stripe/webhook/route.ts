import { getStripe, getWebhookSecret } from "@/modules/pagos/stripe";
import { applyCheckoutEvent } from "@/modules/pagos/webhook";

/**
 * Webhook de Stripe. La firma se verifica ANTES de procesar nada (CLAUDE.md):
 * cualquiera puede enviar un POST a esta URL, y sin la firma correcta no se
 * toca ninguna cita.
 *
 * El cuerpo se lee como texto sin parsear: la firma se calcula sobre los bytes
 * exactos que envió Stripe.
 */
export async function POST(request: Request): Promise<Response> {
  const stripe = getStripe();
  const secret = getWebhookSecret();
  if (!stripe || !secret) {
    return new Response("Pagos no configurados", { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Falta la firma", { status: 400 });

  const payload = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return new Response("Firma inválida", { status: 400 });
  }

  await applyCheckoutEvent(event);
  return Response.json({ received: true });
}
