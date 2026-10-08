import Image from "next/image";
import Link from "next/link";
import { siteContent } from "../../content/site";
import { ButtonLink } from "../ui/button-link";
import { Icon } from "../ui/icon";
import { MobileMenu } from "./mobile-menu";
import { NavLink } from "./nav-link";

/**
 * Cabecera fija del sitio público. Server Component: solo el menú móvil y el
 * estado activo de los enlaces necesitan JavaScript, y están aislados en sus
 * propios componentes cliente.
 */
export function SiteHeader() {
  const { name, logo, primaryNav, headerAction } = siteContent;

  return (
    <header className="fixed top-0 z-50 w-full bg-surface/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-page items-center justify-between px-margin-mobile lg:px-gutter">
        <Link href="/" className="flex items-center gap-4">
          <Image
            src={logo.src}
            alt={logo.alt}
            width={56}
            height={56}
            priority
            className="h-14 w-14 rounded-full object-contain"
          />
          <span className="hidden font-headline-md text-headline-md tracking-tight text-on-surface sm:block">
            {name}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {primaryNav.map((item) => (
            <NavLink key={item.label} {...item} />
          ))}
          <ButtonLink action={headerAction} size="md" className="ml-4" />
        </nav>

        <MobileMenu items={primaryNav} action={headerAction} />

        {/*
         * Acceso de personal*/}
        <Link
          href="/login"
          aria-label="Acceso del personal"
          className="ml-6 hidden h-8 w-8 items-center justify-center rounded-full bg-surface-container text-on-surface transition-colors hover:bg-primary/10 hover:text-primary lg:flex"
        >
          <Icon name="person" className="text-[18px]" />
        </Link>
      </div>
    </header>
  );
}
