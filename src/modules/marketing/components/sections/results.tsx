import Image from "next/image";
import { homeContent } from "../../content/home";
import { Container } from "../ui/container";
import { Icon } from "../ui/icon";
import { StatCard } from "../ui/stat-card";

export function Results() {
  const { title, description, stats, testimonial } = homeContent.results;
  const { author } = testimonial;

  return (
    <section className="relative w-full overflow-hidden bg-surface py-24">
      <Container>
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="flex flex-col gap-10">
            <div>
              <h2 className="mb-4 font-display-lg text-headline-lg text-on-surface">
                {title}
              </h2>
              <p className="font-body-md text-body-lg text-on-surface-variant">
                {description}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
          </div>

          <figure className="relative m-0 flex flex-col gap-8 rounded-2xl bg-surface-container-low p-8 md:p-12">
            <span
              aria-hidden
              className="absolute -top-6 -right-6 font-serif text-[80px] leading-none text-primary/10"
            >
              &ldquo;
            </span>

            <div className="relative z-10">
              <div
                className="mb-6 flex gap-1 text-primary"
                role="img"
                aria-label={`${testimonial.rating} de 5 estrellas`}
              >
                {Array.from({ length: testimonial.rating }, (_, index) => (
                  <Icon
                    key={index}
                    name="star"
                    filled
                    className="text-[20px]"
                  />
                ))}
              </div>

              <blockquote className="m-0 mb-8 font-body-lg text-body-lg text-on-surface italic">
                {testimonial.quote}
              </blockquote>

              <figcaption className="flex items-center gap-4">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-surface-container">
                  <Image
                    src={author.avatar.src}
                    alt={author.avatar.alt}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">
                    {author.name}
                  </p>
                  <p className="font-caption text-caption text-on-surface-variant">
                    {author.role}
                  </p>
                </div>
              </figcaption>
            </div>
          </figure>
        </div>
      </Container>
    </section>
  );
}
