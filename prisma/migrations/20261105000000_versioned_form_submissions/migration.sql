-- Preserve existing forms and answers. Legacy submissions remain without a
-- historical questionnaire snapshot; new submissions always receive one.
ALTER TABLE "FormTemplate"
ADD COLUMN "currentVersion" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "FormTemplateVersion" (
    "id" TEXT NOT NULL,
    "formTemplateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "schemaHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "compositionKeys" TEXT[] NOT NULL,
    "sections" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FormTemplateVersion_pkey" PRIMARY KEY ("id")
);

CREATE TYPE "FormSubmissionStatus" AS ENUM ('SUBMITTED', 'IN_REVIEW', 'COMPLETED');

ALTER TABLE "FormSubmission"
RENAME COLUMN "data" TO "responses";

ALTER TABLE "FormSubmission"
RENAME COLUMN "sensitiveData" TO "sensitiveResponses";

ALTER TABLE "FormSubmission"
ADD COLUMN "formTemplateId" TEXT,
ADD COLUMN "formTemplateVersionId" TEXT,
ADD COLUMN "personEmail" TEXT,
ADD COLUMN "status" "FormSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED';

UPDATE "FormSubmission" AS submission
SET "formTemplateId" = token."formTemplateId",
    "personEmail" = NULLIF(submission."responses"->'address-contact'->>'email', '')
FROM "FormToken" AS token
WHERE submission."tokenId" = token."id";

ALTER TABLE "FormSubmission"
DROP CONSTRAINT "FormSubmission_tokenId_fkey";

ALTER TABLE "FormSubmission"
ADD CONSTRAINT "FormSubmission_tokenId_fkey"
FOREIGN KEY ("tokenId") REFERENCES "FormToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FormTemplateVersion"
ADD CONSTRAINT "FormTemplateVersion_formTemplateId_fkey"
FOREIGN KEY ("formTemplateId") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FormSubmission"
ADD CONSTRAINT "FormSubmission_formTemplateId_fkey"
FOREIGN KEY ("formTemplateId") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FormSubmission"
ADD CONSTRAINT "FormSubmission_formTemplateVersionId_fkey"
FOREIGN KEY ("formTemplateVersionId") REFERENCES "FormTemplateVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "FormTemplateVersion_formTemplateId_version_key"
ON "FormTemplateVersion"("formTemplateId", "version");

CREATE INDEX "FormTemplateVersion_formTemplateId_createdAt_idx"
ON "FormTemplateVersion"("formTemplateId", "createdAt");

CREATE INDEX "FormSubmission_formTemplateId_createdAt_idx"
ON "FormSubmission"("formTemplateId", "createdAt");

CREATE INDEX "FormSubmission_formTemplateVersionId_idx"
ON "FormSubmission"("formTemplateVersionId");

CREATE INDEX "FormSubmission_tokenId_createdAt_idx"
ON "FormSubmission"("tokenId", "createdAt");

CREATE INDEX "FormSubmission_status_createdAt_idx"
ON "FormSubmission"("status", "createdAt");
