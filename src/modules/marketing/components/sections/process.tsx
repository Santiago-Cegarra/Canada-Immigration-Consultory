import Image from "next/image";
import { homeContent } from "../../content/home";
import { Container } from "../ui/container";
import { Icon } from "../ui/icon";
import { ProcessStep } from "../ui/process-step";

export function Process() {
  const { title, description, image, badge, steps } = homeContent.process;

  return (
    <section className="w-full bg-surface-container-low py-20">
      <Container>
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-xl">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-on-surface/10" />

            <div className="absolute right-8 bottom-8 left-8 flex items-center gap-4 rounded-xl border border-surface-container bg-surface-container-lowest/95 p-6 backdrop-blur-xl">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container">
                <Icon name={badge.icon} className="text-[24px] text-primary" />
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface">
                  {badge.title}
                </p>
                <p className="font-caption text-caption text-on-surface-variant">
                  {badge.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-12">
            <div>
              <h2 className="mb-4 font-headline-lg text-headline-lg text-on-surface">
                {title}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {description}
              </p>
            </div>

            <ol className="relative ml-4 space-y-12 border-l-2 border-surface-container">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <ProcessStep {...step} position={index + 1} />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}
