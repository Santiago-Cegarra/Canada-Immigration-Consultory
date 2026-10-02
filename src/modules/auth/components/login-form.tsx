"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions";

const initialState: LoginState = {};

/**
 * Formulario de acceso del personal. Es Client Component solo para mostrar el
 * error de credenciales y el estado de envío (`useActionState`).
 */
export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm leading-6 font-medium text-gray-900"
          >
            Correo electrónico
          </label>
          <div className="mt-2">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:ring-inset sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm leading-6 font-medium text-gray-900"
          >
            Contraseña
          </label>
          <div className="mt-2">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:ring-inset sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm leading-6 font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Iniciando sesión…" : "Iniciar sesión"}
        </button>
      </div>
    </form>
  );
}
