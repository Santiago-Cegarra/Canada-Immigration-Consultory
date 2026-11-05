DROP INDEX IF EXISTS "FormToken_clientEmail_idx";

ALTER TABLE "FormToken"
ADD COLUMN "tokenEncrypted" TEXT,
DROP COLUMN "clientEmail";
