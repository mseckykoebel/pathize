import { Prisma } from "@prisma/client";
import { compactDecrypt, CompactEncrypt, importJWK, JWK, KeyLike } from "jose";

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

if (!process.env.PRIVATE_ENCRYPTION_KEY || !process.env.PUBLIC_ENCRYPTION_KEY) {
  throw new Error("Missing encryption keys");
}

const PRIVATE_KEY = JSON.parse(process.env.PRIVATE_ENCRYPTION_KEY) as JWK;
const PUBLIC_KEY = JSON.parse(process.env.PUBLIC_ENCRYPTION_KEY) as JWK;
const WRITE_ACTIONS = ["create", "update", "upsert"];

// columns we are encrypting
const COLUMNS_WITH_ENCRYPTION = [
  "password",
  "notes",
  "token",
  "phoneNumber",
  "content",
];

const encrypt = async (value: string, publicKey: KeyLike): Promise<string> =>
  await new CompactEncrypt(new TextEncoder().encode(value))
    .setProtectedHeader({ alg: "ECDH-ES+A256KW", enc: "A256GCM" })
    .encrypt(publicKey);

const decrypt = async (value: string, privateKey: KeyLike): Promise<string> => {
  const { plaintext } = await compactDecrypt(value, privateKey);
  return new TextDecoder().decode(plaintext);
};

const encryptOnWrite = async (
  action: Prisma.PrismaAction,
  params: Prisma.MiddlewareParams,
  publicKey: KeyLike
) => {
  // return early if not an encryption action
  if (!WRITE_ACTIONS.includes(action)) return params;

  // one row encryption
  const columns = Object.keys(params.args?.data ?? {});
  for (const column of columns) {
    if (COLUMNS_WITH_ENCRYPTION.includes(column)) {
      const plainText = params.args.data[column];
      const cipherText = await encrypt(plainText, publicKey);
      params.args.data[column] = cipherText;
    }
  }

  return params;
};

const decryptOnRead = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any,
  params: Prisma.MiddlewareParams,
  privateKey: KeyLike
) => {
  // exit early if no results
  if (result === null) return result;

  // one row decryption
  const columns = Object.keys(result ?? {});
  for (const column of columns) {
    if (result[column] && COLUMNS_WITH_ENCRYPTION.includes(column)) {
      const plainText = await decrypt(result[column], privateKey);
      result[column] = plainText;
    }
  }

  // check if the result is an array of items that has encrypted values
  for (let i = 0; i < result.length; i++) {
    const columns = Object.keys(result[i] ?? {});
    for (const column of columns) {
      if (result[i][column] && COLUMNS_WITH_ENCRYPTION.includes(column)) {
        const plainText = await decrypt(result[i][column], privateKey);
        result[i][column] = plainText;
      }
    }
  }

  return result;
};

export const encryptMiddleware = async (): Promise<Prisma.Middleware> => {
  const publicKey = (await importJWK(PUBLIC_KEY, "ECDH-ES+A256KW")) as KeyLike;
  const privateKey = (await importJWK(
    PRIVATE_KEY,
    "ECDH-ES+A256KW"
  )) as KeyLike;

  return async (
    params: Prisma.MiddlewareParams,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    next: (params: Prisma.MiddlewareParams) => Promise<any>
  ) => {
    const { model, action } = params;
    if (!model) {
      // raw SQL queries
      return await next(params);
    }

    const encryptedParams = await encryptOnWrite(action, params, publicKey);
    let result = await next(encryptedParams);
    result = await decryptOnRead(result, params, privateKey);
    return result;
  };
};
