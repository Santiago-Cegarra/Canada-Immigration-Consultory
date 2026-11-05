import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomInt,
} from "node:crypto";

export function normalizeAccessKey(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function hashAccessKey(value: string): string {
  return createHash("sha256")
    .update(normalizeAccessKey(value), "utf8")
    .digest("hex");
}

export function generateAccessKey(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 8 },
    () => alphabet[randomInt(0, alphabet.length)],
  ).join("");
}

function encryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret)
    throw new Error("AUTH_SECRET is required to encrypt access keys");
  return createHash("sha256").update(secret, "utf8").digest();
}

export function encryptAccessKey(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(normalizeAccessKey(value), "utf8"),
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

export function decryptAccessKey(value: string): string {
  const [version, iv, tag, encrypted] = value.split(".");
  if (version !== "v1" || !iv || !tag || !encrypted) {
    throw new Error("Invalid encrypted access key");
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
