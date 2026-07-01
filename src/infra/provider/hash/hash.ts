import argon2 from "argon2";

const PEPPER = process.env.PEPPER;

if (!PEPPER) {
  throw new Error("PEPPER não definido");
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password+PEPPER, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return argon2.verify(hash, password+PEPPER);
}