/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from "fs";
import path from "path";
import os from "os";
import { generateKeyPair, exportJWK } from "jose";

if (process.env.NODE_ENV == "production")
  throw new Error("NODE_ENV must not be production");

const envFilePath = path.resolve(".env.local");

if (!fs.existsSync(envFilePath)) {
  fs.copyFileSync(path.resolve(".env.template"), envFilePath);
}

// read .env file & convert to array
const readEnvVars = () => fs.readFileSync(envFilePath, "utf-8").split(os.EOL);

/**
 * Finds the key in .env files and returns the corresponding value
 *
 * @param {string} key Key to find
 * @returns {string|null} Value of the key
 */
const getEnvValue = (key: string): string | null => {
  // find the line that contains the key (exact match)
  const matchedLine = readEnvVars().find((line) => line.split("=")[0] === key);
  // split the line (delimiter is '=') and return the item at index 2
  return matchedLine !== undefined ? matchedLine.split("=")[1] : null;
};

/**
 * Updates value for existing key or creates a new key=value line
 *
 * This function is a modified version of https://stackoverflow.com/a/65001580/3153583
 *
 * @param {string} key Key to update/insert
 * @param {string} value Value to update/insert
 */
const setEnvValue = (key: string, value: string) => {
  const envVars = readEnvVars();
  const targetLine = envVars.find((line) => line.split("=")[0] === key);
  if (targetLine !== undefined) {
    // update existing line
    const targetLineIndex = envVars.indexOf(targetLine);
    // replace the key/value with the new value
    envVars.splice(targetLineIndex, 1, `${key}=${value}`);
  } else {
    // create new key value
    envVars.push(`${key}=${value}`);
  }
  // write everything back to the file system
  fs.writeFileSync(envFilePath, envVars.join(os.EOL));
};

const generateAndExportKeyPair = async (alg: string) => {
  const { publicKey, privateKey } = await generateKeyPair(alg);

  const privateJwk = await exportJWK(privateKey);
  const publicJwk = await exportJWK(publicKey);
  return { publicJwk, privateJwk };
};

async function setupEnv() {
  const { publicJwk: publicAccessTokenKey, privateJwk: privateAccessTokenKey } =
    await generateAndExportKeyPair("ES256");

  const {
    publicJwk: publicRefreshTokenKey,
    privateJwk: privateRefreshTokenKey,
  } = await generateAndExportKeyPair("ES256");

  const {
    publicJwk: publicPasswordResetKey,
    privateJwk: privatePasswordResetKey,
  } = await generateAndExportKeyPair("ES256");

  // access token key pair
  setEnvValue("PUBLIC_ACCESS_TOKEN_KEY", JSON.stringify(publicAccessTokenKey));
  setEnvValue(
    "PRIVATE_ACCESS_TOKEN_KEY",
    JSON.stringify(privateAccessTokenKey),
  );
  // refresh token key pair
  setEnvValue(
    "PUBLIC_REFRESH_TOKEN_KEY",
    JSON.stringify(publicRefreshTokenKey),
  );
  setEnvValue(
    "PRIVATE_REFRESH_TOKEN_KEY",
    JSON.stringify(privateRefreshTokenKey),
  );
  // password reset key pair
  setEnvValue(
    "PUBLIC_PASSWORD_RESET_TOKEN_KEY",
    JSON.stringify(publicPasswordResetKey),
  );
  setEnvValue(
    "PRIVATE_PASSWORD_RESET_TOKEN_KEY",
    JSON.stringify(privatePasswordResetKey),
  );

  console.log(
    "✅ .env.local setup complete. You should now have both public and private keys for access, refresh, and password reset tokens.",
  );
}

setupEnv();
