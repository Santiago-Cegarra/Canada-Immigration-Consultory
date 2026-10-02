"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = {
  error?: string;
};

/**
 * Inicia sesión del personal.
 *
 * Con credenciales inválidas, Auth.js LANZA `CredentialsSignin` en lugar de
 * devolver un resultado; aquí se convierte en un mensaje para el formulario.
 * Cualquier otro error se relanza, incluido el de la redirección tras un login
 * correcto (Next implementa `redirect()` lanzando un error especial).
 *
 * Solo se reenvían `email` y `password`: pasar el FormData entero permitiría
 * que el cliente inyectara opciones de Auth.js como `redirectTo`.
 */
export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          error.type === "CredentialsSignin"
            ? "Correo o contraseña incorrectos."
            : "No se pudo iniciar sesión. Inténtalo de nuevo.",
      };
    }
    throw error;
  }
}
