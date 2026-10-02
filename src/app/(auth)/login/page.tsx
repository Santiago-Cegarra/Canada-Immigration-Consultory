import type { Metadata } from "next";
import { LoginForm } from "@/modules/auth/components/login-form";

export const metadata: Metadata = {
  title: "Acceso del personal",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Acceso del Personal
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Inicia sesión con tu correo y contraseña.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
