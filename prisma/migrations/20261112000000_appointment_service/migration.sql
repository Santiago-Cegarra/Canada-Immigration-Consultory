-- Trámite desde el que el cliente llegó a reservar la consulta (informativo).
ALTER TABLE "Appointment" ADD COLUMN "serviceSlug" TEXT,
ADD COLUMN "serviceTitle" TEXT;
