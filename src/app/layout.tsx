import type { Metadata } from "next";
import { Hanken_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { siteContent } from "@/modules/marketing/content/site";

/*
 * Las fuentes que el HTML cargaba con un `<link>` a Google se sirven ahora desde
 * `next/font`: se autoalojan, no hay petición externa y no hay parpadeo de
 * texto. Los pesos son los mismos que pedía el diseño.
 *
 * Cada fuente expone una variable CSS que `globals.css` consume.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteContent.legalName} — Asesoría migratoria para Canadá`,
    template: `%s — ${siteContent.legalName}`,
  },
  description: siteContent.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${hankenGrotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface font-body-md text-on-surface">
        {/*
         * Fuente de iconos. Material Symbols no está en `next/font/google`, así
         * que va como hoja de estilo externa; React la eleva al `<head>` gracias
         * a `precedence`.
         *
         * `display=block` es obligatorio aquí: los iconos se escriben como
         * ligaduras (`arrow_forward`), así que con el comportamiento por defecto
         * el navegador mostraría ese texto con la fuente de respaldo hasta que
         * cargue la real.
         *
         * Las dos reglas de ESLint se desactivan a conciencia:
         * - `no-page-custom-font` avisa de fuentes declaradas en una sola
         *   página; esto es el layout raíz, así que aplica a todo el sitio.
         * - `google-font-display` recomienda `optional`, que para una fuente de
         *   iconos es peor: si tarda en cargar, el respaldo se queda de forma
         *   permanente y el usuario ve los nombres de los iconos como texto.
         *
         * TODO: autoalojarla con `next/font/local` para eliminar esta petición a
         * un tercero.
         */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font, @next/next/google-font-display */}
        <link
          rel="stylesheet"
          precedence="default"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
        {children}
      </body>
    </html>
  );
}
