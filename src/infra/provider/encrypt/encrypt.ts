import crypto from 'crypto';

export function decryptApiToken(token: string): string {
    const key = Buffer.from(
      process.env.SECRET_API_TOKEN_KEY!,
      "hex"
    );

    const [ivHex, encrypted] = token.split(":");

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      key,
      Buffer.from(ivHex, "hex")
    );

    return (
      decipher.update(encrypted, "hex", "utf8") +
      decipher.final("utf8")
    );
  }