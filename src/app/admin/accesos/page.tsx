import { revokeAccessKey } from "@/modules/formularios/access-actions";
import {
  listAccessKeyOptions,
  listAccessKeys,
} from "@/modules/formularios/access";
import { requireAdmin } from "@/modules/auth/guards";
import { AccessKeyManager } from "@/modules/formularios/components/access-key-manager";
import { RevealAccessKeyButton } from "@/modules/formularios/components/reveal-access-key-button";

function accessStatus(token: { revokedAt: Date | null; expiresAt: Date }): {
  label: string;
  classes: string;
} {
  if (token.revokedAt) {
    return {
      label: "Revocada",
      classes: "bg-error-container text-on-error-container",
    };
  }
  if (token.expiresAt <= new Date()) {
    return {
      label: "Vencida",
      classes: "bg-surface-container text-on-surface-variant",
    };
  }
  return { label: "Activa", classes: "bg-green-100 text-green-800" };
}

export default async function AccessKeysPage() {
  await requireAdmin();
  const [{ templates, professionals }, tokens] = await Promise.all([
    listAccessKeyOptions(),
    listAccessKeys(),
  ]);

  return (
    <div>
      <p className="font-label-md text-primary">ACCESO DE CLIENTES</p>
      <h1 className="mt-2 font-headline-lg text-3xl">Claves de acceso</h1>
      <p className="mt-2 max-w-3xl text-on-surface-variant">
        El cliente introduce la clave antes de recibir las preguntas. La clave
        sirve para cualquier visitante que la conozca. Se valida con un hash y
        la copia recuperable permanece cifrada para el administrador.
      </p>

      <div className="mt-8">
        <AccessKeyManager templates={templates} professionals={professionals} />
      </div>

      <section className="mt-10">
        <h2 className="font-headline-md text-2xl">Accesos generados</h2>
        {tokens.length ? (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-outline-variant/70 bg-surface-container-lowest shadow-sm">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant">
                <tr>
                  <th className="px-5 py-3 font-label-md">Clave</th>
                  <th className="px-5 py-3 font-label-md">Formulario</th>
                  <th className="px-5 py-3 font-label-md">Responsable</th>
                  <th className="px-5 py-3 font-label-md">Estado</th>
                  <th className="px-5 py-3 font-label-md">Envíos</th>
                  <th className="px-5 py-3 font-label-md">Vence</th>
                  <th className="px-5 py-3 font-label-md">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {tokens.map((token) => {
                  const status = accessStatus(token);
                  return (
                    <tr key={token.id}>
                      <td className="px-5 py-4">
                        <p className="text-xs text-on-surface-variant">
                          Termina en ···{token.tokenHint ?? "—"}
                        </p>
                        <RevealAccessKeyButton tokenId={token.id} />
                      </td>
                      <td className="px-5 py-4">
                        {token.formTemplate?.name ?? "Formulario eliminado"}
                      </td>
                      <td className="px-5 py-4">
                        {token.professional.name ?? token.professional.email}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.classes}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">{token._count.submissions}</td>
                      <td className="px-5 py-4">
                        {token.expiresAt.toLocaleDateString("es-CA")}
                      </td>
                      <td className="px-5 py-4">
                        {!token.revokedAt && token.expiresAt > new Date() && (
                          <form action={revokeAccessKey}>
                            <input type="hidden" name="id" value={token.id} />
                            <button
                              type="submit"
                              className="font-semibold text-error hover:underline"
                            >
                              Revocar
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center text-on-surface-variant">
            Todavía no se ha generado ninguna clave.
          </div>
        )}
      </section>
    </div>
  );
}
