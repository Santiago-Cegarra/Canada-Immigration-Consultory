import { ButtonLink } from "@/modules/marketing/components/ui/button-link";
import { Container } from "@/modules/marketing/components/ui/container";
import { Icon } from "@/modules/marketing/components/ui/icon";
import { serviciosContent } from "@/modules/marketing/content/servicios";

/**
 * 404 de un trámite que no existe. Se muestra dentro del layout del sitio
 * (cabecera y pie) cuando `page.tsx` llama a `notFound()`.
 */
export default function ServiceNotFound() {
  const { title, description, servicesAction, bookingAction } =
    serviciosContent.notFound;

  return (
    <section className="w-full py-20 lg:py-28">
      <Container className="flex max-w-2xl flex-col items-center gap-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed/40 text-on-primary-fixed-variant">
          <Icon name="help" className="text-[32px]" />
        </span>
        <h1 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg">
          {title}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          {description}
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <ButtonLink action={servicesAction} />
          <ButtonLink action={bookingAction} variant="secondary" />
        </div>
      </Container>
    </section>
  );
}
