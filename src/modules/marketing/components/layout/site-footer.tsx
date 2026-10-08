import Image from "next/image";
import Link from "next/link";
import { siteContent } from "../../content/site";
import { Container } from "../ui/container";
import { Icon } from "../ui/icon";

export function SiteFooter() {
  const { logo, footer } = siteContent;
  const { tagline, groups, contact, legalNotice, flag, flagLabel } = footer;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-surface-container bg-surface-container-low py-20">
      <Container>
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div>
            <Image
              src={logo.src}
              alt={logo.alt}
              width={80}
              height={80}
              className="mb-6 h-20 w-20 rounded-full object-contain"
            />
            <p className="font-body-md text-body-md text-on-surface-variant">
              {tagline}
            </p>
          </div>

          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="mb-6 font-label-md text-label-md tracking-wider text-on-surface uppercase">
                {group.title}
              </h2>
              <ul className="space-y-4">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="-my-2 inline-block py-2 font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="mb-6 font-label-md text-label-md tracking-wider text-on-surface uppercase">
              {contact.title}
            </h2>
            <p className="mb-2 font-body-md text-body-md text-on-surface-variant">
              {contact.location}
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="mb-2 block font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary"
            >
              {contact.email}
            </a>
            <div className="mt-6 flex gap-4">
              {contact.social.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="rounded-full bg-surface-container p-2 text-on-surface-variant transition-colors hover:text-primary"
                >
                  {link.icon && <Icon name={link.icon} />}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-surface-container pt-8 md:flex-row">
          <p className="text-center font-caption text-caption text-on-surface-variant md:text-left">
            © {currentYear} {siteContent.legalName}. {legalNotice}
          </p>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Image
              src={flag.src}
              alt={flag.alt}
              width={20}
              height={12}
              className="h-3 w-auto opacity-80"
            />
            <span className="font-caption text-caption">{flagLabel}</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
