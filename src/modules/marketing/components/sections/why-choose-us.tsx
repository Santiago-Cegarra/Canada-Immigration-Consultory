import type { Feature } from "../../types";
import { Container } from "../ui/container";
import { FeatureItem } from "../ui/feature-item";

type WhyChooseUsProps = {
  title: string;
  description: string;
  items: Feature[];
};

/** Argumentos de confianza en columnas; en móvil se apilan. */
export function WhyChooseUs({ title, description, items }: WhyChooseUsProps) {
  return (
    <section className="w-full bg-surface-container-lowest py-16 lg:py-24">
      <Container>
        <div className="mb-12 text-center lg:mb-16">
          <h2 className="mb-4 font-headline-lg text-headline-lg text-on-surface">
            {title}
          </h2>
          <p className="mx-auto max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {items.map((item) => (
            <FeatureItem key={item.title} {...item} />
          ))}
        </div>
      </Container>
    </section>
  );
}
