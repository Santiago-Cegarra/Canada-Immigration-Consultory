import { Container } from "../ui/container";

type PageBannerProps = {
  title: string;
  description: string;
};

/** Banda negra con el título de una página interior. */
export function PageBanner({ title, description }: PageBannerProps) {
  return (
    <section className="w-full bg-inverse-surface py-16 lg:py-20">
      <Container>
        <span aria-hidden className="mb-4 block h-[2px] w-12 bg-primary" />
        <h1 className="mb-4 font-display-lg text-display-lg text-inverse-on-surface">
          {title}
        </h1>
        <p className="max-w-xl font-body-lg text-body-lg text-tertiary-fixed-dim">
          {description}
        </p>
      </Container>
    </section>
  );
}
