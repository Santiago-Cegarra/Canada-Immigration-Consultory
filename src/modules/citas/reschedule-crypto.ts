import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

export function normalizeRescheduleToken(value: string): string {
  return value.trim();
}

export function hashRescheduleToken(value: string): string {
  return createHash("sha256")
    .update(normalizeRescheduleToken(value), "utf8")
    .digest("hex");
}

export function generateRescheduleToken(): string {
  return randomBytes(24).toString("base64url");
}

function encryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET || "hic-fallback-dev-secret-key-2026";
  return createHash("sha256").update(secret, "utf8").digest();
}

export function encryptRescheduleToken(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(normalizeRescheduleToken(value), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptRescheduleToken(value: string): string {
  const [version, iv, tag, encrypted] = value.split(".");
  if (version !== "v1" || !iv || !tag || !encrypted) {
    throw new Error("Invalid encrypted reschedule token");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
