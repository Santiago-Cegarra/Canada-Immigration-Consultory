import Image from "next/image";
import Link from "next/link";
import { contactoContent } from "../../content/contacto";
import { siteContent } from "../../content/site";
import { ButtonLink } from "../ui/button-link";
import { Icon } from "../ui/icon";

/** Tarjeta negra con los datos de contacto, redes, mapa y botón de WhatsApp. */
export function ContactInfo() {
  const { title, details, socialTitle, social, map, whatsappAction } =
    contactoContent.info;
  const { logo } = siteContent;

  return (
    <aside className="flex flex-col gap-8 rounded-2xl bg-inverse-surface p-8 text-inverse-on-surface md:p-10">
      <div className="flex items-center gap-4">
        <Image
          src={logo.src}
          alt={logo.alt}
          width={64}
          height={64}
          className="h-16 w-16 rounded-full object-contain"
        />
        <h2 className="font-headline-md text-headline-md">{title}</h2>
      </div>

      <ul className="flex flex-col gap-5">
        {details.map((detail) => (
          <li key={detail.label} className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Icon name={detail.icon} className="text-[20px]" />
            </span>
            <div>
              <p className="font-caption text-caption tracking-wider text-tertiary-fixed-dim uppercase">
                {detail.label}
              </p>
              {"href" in detail && detail.href ? (
                <a
                  href={detail.href}
                  className="font-body-md text-body-md transition-colors hover:text-primary-fixed-dim"
                >
                  {detail.value}
                </a>
              ) : (
                <p className="font-body-md text-body-md">{detail.value}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div>
        <p className="mb-3 font-label-md text-label-md text-tertiary-fixed-dim">
          {socialTitle}
        </p>
        <div className="flex flex-wrap gap-2">
          {social.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-full border border-inverse-on-surface/20 px-4 py-2 font-caption text-caption transition-colors hover:border-primary hover:text-primary-fixed-dim"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="aspect-video w-full overflow-hidden rounded-xl bg-on-surface">
        <iframe
          title={map.title}
          src={map.src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0 grayscale"
        />
      </div>

      <ButtonLink action={whatsappAction} className="w-full" />
    </aside>
  );
}
