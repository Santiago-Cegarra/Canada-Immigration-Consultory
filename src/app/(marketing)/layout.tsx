import { SiteFooter } from "@/modules/marketing/components/layout/site-footer";
import { SiteHeader } from "@/modules/marketing/components/layout/site-header";

/**
 * Layout del sitio público. Todo lo que viva dentro de `(marketing)` comparte
 * cabecera y pie sin repetirlos.
 *
 * `(marketing)` es un grupo de rutas: los paréntesis lo excluyen de la URL, así
 * que `(marketing)/page.tsx` es `/`, no `/marketing`.
 *
 * El `pt-20` compensa la altura de la cabecera, que es `fixed`.
 */
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="w-full flex-1 bg-surface pt-20">{children}</main>
      <SiteFooter />
    </>
  );
}
