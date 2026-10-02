import { homeContent } from "../../content/home";
import { Container } from "../ui/container";
import { ServiceCard } from "../ui/service-card";

export function Services() {
  const { title, description, items } = homeContent.services;

  return (
    <section className="relative w-full overflow-hidden bg-surface py-20">
      {/* Halo decorativo de fondo. */}
      <div className="absolute top-0 right-0 h-[600px] w-[600px] translate-x-1/3 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      <Container className="relative z-10">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 font-headline-lg text-headline-lg text-on-surface">
            {title}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {items.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </Container>
    </section>
  );
}
