import { homeContent } from "../../content/home";
import { Container } from "../ui/container";
import { Icon } from "../ui/icon";

export function TrustBadges() {
  const { title, badges } = homeContent.trust;

  return (
    <section className="w-full border-b border-surface-container bg-surface py-12">
      <Container>
        <p className="mb-8 text-center font-caption text-caption tracking-widest text-on-surface-variant uppercase">
          {title}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 grayscale transition-all duration-500 hover:grayscale-0 md:gap-24">
          {badges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-3">
              <Icon name={badge.icon} className="text-[32px] text-on-surface" />
              <span className="font-label-md text-label-md font-bold text-on-surface">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
