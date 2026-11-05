"use client";

import { useState, useTransition } from "react";
import { revealAccessKey } from "../access-actions";

export function RevealAccessKeyButton({ tokenId }: { tokenId: string }) {
  const [accessKey, setAccessKey] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function toggle() {
    if (accessKey) {
      setAccessKey(undefined);
      return;
    }

    startTransition(async () => {
      const result = await revealAccessKey(tokenId);
      if (result.ok) {
        setAccessKey(result.accessKey);
        setError(undefined);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline disabled:opacity-50"
      >
        <span
          className="material-symbols-outlined text-[18px]"
          aria-hidden="true"
        >
          {accessKey ? "visibility_off" : "visibility"}
        </span>
        {pending ? "Cargando…" : accessKey ? "Ocultar" : "Ver clave"}
      </button>
      {accessKey && (
        <code className="block font-bold tracking-wider select-all">
          {accessKey}
        </code>
      )}
      {error && <p className="max-w-52 text-xs text-error">{error}</p>}
    </div>
  );
}
