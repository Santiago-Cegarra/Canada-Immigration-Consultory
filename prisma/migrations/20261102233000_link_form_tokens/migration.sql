-- Las claves nuevas se guardan como hash, no como texto recuperable.
ALTER TABLE "FormToken" ALTER COLUMN "token" DROP DEFAULT;

ALTER TABLE "FormToken"
ADD COLUMN "tokenHint" TEXT,
ADD COLUMN "formTemplateId" TEXT,
ADD COLUMN "revokedAt" TIMESTAMP(3),
ADD COLUMN "lastUsedAt" TIMESTAMP(3);

CREATE INDEX "FormToken_formTemplateId_idx" ON "FormToken"("formTemplateId");
CREATE INDEX "FormToken_clientEmail_idx" ON "FormToken"("clientEmail");

ALTER TABLE "FormToken"
ADD CONSTRAINT "FormToken_formTemplateId_fkey"
FOREIGN KEY ("formTemplateId") REFERENCES "FormTemplate"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
