type HighlightedTextProps = {
  text: string;
  /**
   * Color del énfasis. Rojo Hoja de Arce sobre fondos claros; sobre fondos
   * oscuros el rojo no llega al contraste mínimo (2,6:1), así que se usa Arce
   * Claro: `text-primary-fixed-dim` (10:1).
   */
  emphasisClassName?: string;
};

/**
 * Texto con fragmentos resaltados. Los fragmentos se marcan con llaves en el
 * contenido: `"Tu futuro en {Canadá} comienza"`. Así el énfasis se edita desde
 * `content/` sin tocar el markup.
 */
export function HighlightedText({
  text,
  emphasisClassName = "text-primary",
}: HighlightedTextProps) {
  return (
    <>
      {text.split(/\{([^}]+)\}/).map((fragment, index) =>
        index % 2 === 1 ? (
          <span key={index} className={emphasisClassName}>
            {fragment}
          </span>
        ) : (
          fragment
        ),
      )}
    </>
  );
}
