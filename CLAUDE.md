@AGENTS.md

# MigrationCanada

Sitio web para una firma de migración a Canadá. Combina una página **informativa**
(pública, orientada a SEO) con un sistema de **agendamiento de citas pagadas** con
profesionales, y **formularios protegidos** para recolección de datos sensibles.

## Roles y acceso

- **Cliente (público general)**: no requiere cuenta. Agenda y paga citas directamente.
- **Profesional (abogado de inmigración o consultor de migración, ej. RCIC)**: tiene
  horario individual propio. El sitio soporta ambos tipos de profesional (no todos
  son abogados con título).
- **Admin**: gestiona tokens de acceso a formularios y visualiza los datos enviados
  en ellos.

No hay roles adicionales por ahora (no hay "cuenta de cliente").

## Funcionalidades principales

1. **Página informativa** — contenido público, sin restricciones.
2. **Agendamiento de citas**
   - Cada profesional tiene su propio horario disponible.
   - Las consultorías tienen **duración fija**.
   - **No se permiten cancelaciones.**
   - **Sí se permite reprogramar.**
   - **No hay reembolsos** (relevante para el flujo de pagos: no implementar
     lógica de refund automático).
   - Requiere **emails automáticos** de confirmación y recordatorio de cita.
3. **Pagos con Stripe** — se cobran al momento de agendar la cita.
4. **Formularios protegidos** — de acceso público restringido. El público
   necesita un **token/clave** (entregado por el personal) para acceder a un
   formulario específico. Ver "Formularios y modelo de datos".
5. **Panel de administrador**
   - Genera/gestiona los tokens de acceso a formularios.
   - Consulta los datos enviados en los formularios.

## Formularios y modelo de datos

**Fuente oficial de preguntas:** [info_necesary.txt](docs/info_necesary.txt). No es un
formulario en sí: es el **banco centralizado de preguntas** (17 secciones). Los
formularios reales son subconjuntos de esas secciones según el tipo de trámite,
y varios formularios repiten las mismas preguntas.

- **Secciones reutilizables**: cada sección (datos personales, pasaporte,
  educación, empleos, etc.) se define una sola vez con su esquema de validación
  y se compone en los distintos tipos de formulario. Nunca duplicar la definición
  de una pregunta entre formularios.
- **Sin form builder dinámico**: los tipos de formulario se definen en código
  componiendo secciones. No construir un editor de formularios en BD salvo que
  se pida explícitamente.
- **Token**: uno por **tipo de formulario + cliente**. Con el mismo token, el
  cliente puede registrar a **varios familiares**, pero solo para ese tipo de
  formulario. Cada persona registrada tiene sus propias respuestas.
- **Agente asignado**: cada token/caso tiene un profesional asignado.

### Reglas de datos (derivadas del banco de preguntas)

- Nombres **exactamente como en el pasaporte**.
- Fechas completas en `AAAA-MM-DD`; estudios y empleos en `AAAA-MM`.
- Distinguir tres estados en las respuestas: valor real, **"No aplica"** y
  **"Desconocido"**. No son lo mismo que un campo vacío.
- **Preguntas condicionales**: muchas respuestas Sí/No habilitan campos o
  bloques adicionales (ej. otros nombres, dirección postal distinta, green card).
- **Bloques repetibles**: países de residencia previos (últimos 5 años, >6
  meses), relaciones anteriores, empleos/actividades, respuestas afirmativas
  del historial migratorio.
- **Empleos/actividades**: cubren los **últimos 10 años sin períodos sin
  explicar** (incluye estudios, desempleo, hogar). Validar que no haya huecos.
- **Secciones 12–16 solo aplican a personas de 18 años o más** (se determina
  con la fecha de nacimiento).

## Stack tecnológico

- **Frontend/Backend**: Next.js 16 (App Router, `src/`), TypeScript, Tailwind 4.
  Next 16 tiene cambios incompatibles con versiones previas: ver AGENTS.md.
- **Base de datos**: PostgreSQL. Local con Docker; producción en Neon.
- **ORM**: Prisma 7 con driver adapter (`@prisma/adapter-pg`). El cliente se
  genera en `src/generated/prisma` (no se versiona) y se usa solo vía
  `src/lib/db.ts`.
  - Prisma está fijado en **7.10.0** a propósito: la etiqueta `latest` de npm
    apunta a una RC de Prisma 8. No actualizar sin decidirlo explícitamente.
- **Pagos**: Stripe.
- **Emails transaccionales**: Resend (+ React Email para plantillas).
- **Auth del personal**: Auth.js.
- **Hosting**: Vercel (despliegue nativo, sin Docker en producción).
- **Pruebas**: Vitest (`src/**/*.test.ts`). **Formato**: Prettier + ESLint.
- **Gestor de paquetes**: pnpm. Los scripts de instalación de dependencias
  están bloqueados por defecto; se autorizan en `pnpm-workspace.yaml`
  (`allowBuilds`).

## Comandos

- `pnpm db:up` — levanta Postgres local (Docker, **puerto 5433**; el 5432 lo
  ocupa un PostgreSQL instalado en Windows).
- `pnpm dev` — servidor de desarrollo.
- `pnpm db:migrate` — crea/aplica migraciones en desarrollo.
- `pnpm check` — typecheck + lint + formato + tests. Correrlo antes de dar un
  cambio por terminado.
- `pnpm build` — build de producción.

Primer uso: copiar `.env.example` a `.env`.

## Estructura

Código de dominio en `src/modules/<dominio>/` (ej. `citas`, `pagos`,
`formularios`, `admin`, `auth`); rutas de Next en `src/app/`, que solo
orquestan y delegan en los módulos. Utilidades compartidas en `src/lib/`.
Crear cada carpeta cuando haga falta, no por adelantado.

## Principios de arquitectura

- **Modular pero sin sobreingeniería**: separar por dominio (citas, pagos,
  formularios, auth de tokens, admin) en lugar de por capa técnica genérica.
  No crear abstracciones/interfaces para un solo caso de uso o para "por si
  acaso se necesita después".
- **SOLID con moderación**: aplicar donde aporte claridad real (ej. separar la
  lógica de negocio de citas de la integración con Stripe), no forzar patrones
  (factories, inyección de dependencias compleja, etc.) donde una función
  simple basta.
- **Buenas prácticas generales**: validación en los límites del sistema
  (inputs de formularios públicos, webhooks de Stripe), manejo explícito de
  errores en pagos y agendamiento, sin lógica duplicada entre flujos de
  abogado/consultor si pueden compartir el mismo modelo.

## Seguridad

- Los formularios protegidos se acceden con un **token/clave** entregado por
  el personal (no es un login de usuario). Definir junto con el ORM: expiración,
  uso único vs reutilizable, y cómo se generan desde el panel admin.
- El panel de administrador usa login del personal (Auth.js) — no debe confundirse con los tokens de los formularios,
  que son para clientes/público, no para el admin.
- **Datos sensibles** (secciones 12–16: salud, historial migratorio,
  antecedentes penales, servicio militar/policial, organizaciones): van en el
  mismo formulario, pero **solo pueden verlos el admin y el agente asignado**
  al caso. El resto de agentes no tiene acceso. Esta restricción se aplica en
  el backend, no solo ocultándolo en la UI.
- Todo el banco de preguntas contiene datos personales (pasaporte, documento
  de identidad, dirección): tratarlos como confidenciales, nunca registrarlos
  en logs.
- Los webhooks de Stripe deben verificarse (firma de Stripe) antes de
  procesar cualquier evento de pago.

## Flujo de trabajo

- **PROHIBIDO hacer commits.** El control de versiones lo maneja
  exclusivamente el usuario. Claude no ejecuta `git commit`, `git init`,
  `push`, `merge`, `rebase`, `stash`, `checkout`/`switch`, ni crea o borra
  ramas, ni hace ningún otro comando que modifique el repositorio. Tampoco
  introduce carpetas `.git` generadas por herramientas (ej. `create-next-app`
  crea un repo con commit automático: usar `--disable-git` o equivalente).
  Solo se permiten comandos de lectura (`git status`, `git diff`, `git log`).

- **Antes de implementar un cambio**, revisar de forma general qué
  funcionalidades existentes se ven afectadas (agendamiento, pagos,
  formularios, panel admin) para validar que la aplicación completa siga
  funcionando correctamente. No asumir que un cambio es aislado sin antes
  verificar sus dependencias.

## Pendientes / decisiones abiertas

- Política de expiración/reuso de tokens de formularios.
- Qué secciones componen cada tipo de formulario (lista de tipos de trámite).
- Cifrado de campos sensibles en reposo (recomendado; al estar en Canadá
  aplica PIPEDA).
- Zona horaria: se decidió guardar en UTC y mostrar en la zona de quien ve;
  falta definir la zona de referencia de los horarios de cada profesional.
