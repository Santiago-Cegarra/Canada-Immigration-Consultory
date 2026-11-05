-- La plantilla ya se referencia por FK y las claves admiten varios envíos.
ALTER TABLE "FormToken"
DROP COLUMN "formType",
DROP COLUMN "isUsed";
