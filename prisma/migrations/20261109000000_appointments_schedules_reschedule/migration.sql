-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "confirmationEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "lastRescheduledAt" TIMESTAMP(3),
ADD COLUMN     "meetingUrl" TEXT,
ADD COLUMN     "reminderEmailId" TEXT,
ADD COLUMN     "rescheduleTokenEncrypted" TEXT,
ADD COLUMN     "rescheduleTokenHash" TEXT,
ADD COLUMN     "rescheduledCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ProfessionalSchedule" (
    "id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Consultor migratorio regulado (RCIC)',
    "timeZone" TEXT NOT NULL DEFAULT 'America/Toronto',
    "weekdays" INTEGER[] DEFAULT ARRAY[3]::INTEGER[],
    "startTimes" TEXT[] DEFAULT ARRAY['09:30', '11:15', '14:30', '16:15', '18:00']::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionalSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalSchedule_professionalId_key" ON "ProfessionalSchedule"("professionalId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_rescheduleTokenHash_key" ON "Appointment"("rescheduleTokenHash");

-- CreateIndex
CREATE INDEX "Appointment_professionalId_startTime_idx" ON "Appointment"("professionalId", "startTime");

-- CreateIndex
CREATE INDEX "Appointment_paymentStatus_startTime_idx" ON "Appointment"("paymentStatus", "startTime");

-- AddForeignKey
ALTER TABLE "ProfessionalSchedule" ADD CONSTRAINT "ProfessionalSchedule_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
