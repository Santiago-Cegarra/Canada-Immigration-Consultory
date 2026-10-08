/**
 * Texto con fragmentos resaltados en color primario. Los fragmentos se marcan
 * con llaves en el contenido: `"Tu futuro en {Canadá} comienza"`. Así el énfasis
 * se edita desde `content/` sin tocar el markup.
 */
export function HighlightedText({ text }: { text: string }) {
  return (
    <>
      {text.split(/\{([^}]+)\}/).map((fragment, index) =>
        index % 2 === 1 ? (
          <span key={index} className="text-primary">
            {fragment}
          </span>
        ) : (
          fragment
        ),
      )}
    </>
  );
}
