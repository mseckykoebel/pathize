import { jwtVerify, SignJWT, importJWK, KeyLike, JWK, JWTPayload } from "jose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

// SIGNING

if (
  !process.env.PRIVATE_ACCESS_TOKEN_KEY ||
  !process.env.PRIVATE_REFRESH_TOKEN_KEY ||
  !process.env.PRIVATE_PASSWORD_RESET_TOKEN_KEY
) {
  throw new Error("Missing private key for signing JWT");
}

const PRIVATE_ACCESS_TOKEN_KEY = JSON.parse(
  process.env.PRIVATE_ACCESS_TOKEN_KEY,
) as unknown as JWK;
const PRIVATE_REFRESH_TOKEN_KEY = JSON.parse(
  process.env.PRIVATE_REFRESH_TOKEN_KEY,
) as unknown as JWK;
const PRIVATE_PASSWORD_RESET_TOKEN_KEY = JSON.parse(
  process.env.PRIVATE_PASSWORD_RESET_TOKEN_KEY,
) as unknown as JWK;

// Takes a JWT payload, containing the user email, and generates just an access token
export const generateAccessToken = async (options?: JWTPayload) => {
  // JWT for access has expiration date
  const unsignedAccessToken = new SignJWT(options ?? {})
    .setProtectedHeader({ alg: "ES256", typ: "JWT" })
    .setIssuedAt()
    .setIssuer("Pathize")
    .setAudience("https://pathizehealth.com")
    .setExpirationTime("45s");
  // prepare the key
  const accessKey = await generateAccessTokenSecretKey();
  const accessToken = await unsignedAccessToken.sign(accessKey);
  // return both tokens
  return { accessToken: accessToken };
};

// Takes a JWT payload, containing the user email, and generates both an access and refresh token
export const generateAccessAndRefreshTokens = async (options?: JWTPayload) => {
  // JWT for access has expiration date
  const unsignedAccessToken = new SignJWT(options ?? {})
    .setProtectedHeader({ alg: "ES256", typ: "JWT" })
    .setIssuedAt()
    .setIssuer("Pathize")
    .setAudience("https://pathizehealth.com");
  // JWT for refresh does not have expiration date, but is deleted on user logout
  const unsignedRefreshToken = new SignJWT(options ?? {})
    .setProtectedHeader({ alg: "ES256", typ: "JWT" })
    .setIssuedAt()
    .setIssuer("Pathize")
    .setAudience("https://pathizehealth.com");
  // prepare the keys
  const accessKey = await generateAccessTokenSecretKey();
  const refreshKey = await generateRefreshTokenSecretKey();
  const accessToken = await unsignedAccessToken.sign(accessKey);
  const refreshToken = await unsignedRefreshToken.sign(refreshKey);
  // return both tokens
  return { accessToken: accessToken, refreshToken: refreshToken };
};

export const generatePasswordResetToken = async (options?: JWTPayload) => {
  // JWT for access has expiration date
  const unsignedPasswordResetToken = new SignJWT(options ?? {})
    .setProtectedHeader({ alg: "ES256", typ: "JWT" })
    .setIssuedAt()
    .setIssuer("Pathize")
    .setAudience("https://pathizehealth.com")
    .setExpirationTime("15m");
  // prepare the key
  const passwordResetKey = await generatePasswordResetTokenSecretKey();
  const passwordResetToken = await unsignedPasswordResetToken.sign(
    passwordResetKey,
  );

  return { passwordResetToken: passwordResetToken };
};

// VERIFICATION

// used to generate the secret key for signing and verifying the JWT
// returns an asymmetric key or symmetric secret
const generateAccessTokenSecretKey = async (): Promise<
  KeyLike | Uint8Array
> => {
  return await importJWK(PRIVATE_ACCESS_TOKEN_KEY as JWK, "ES256");
};

// used to generate the secret key for signing and verifying the JWT
// returns an asymmetric key or symmetric secret
const generateRefreshTokenSecretKey = async (): Promise<
  KeyLike | Uint8Array
> => {
  return await importJWK(PRIVATE_REFRESH_TOKEN_KEY as JWK, "ES256");
};

const generatePasswordResetTokenSecretKey = async (): Promise<
  KeyLike | Uint8Array
> => {
  return await importJWK(PRIVATE_PASSWORD_RESET_TOKEN_KEY as JWK, "ES256");
};

export const verifyAccessToken = async (jwt: string) => {
  const secretKey = await generateAccessTokenSecretKey();
  return await jwtVerify(jwt, secretKey);
};

export const verifyRefreshToken = async (jwt: string) => {
  const secretKey = await generateRefreshTokenSecretKey();
  return await jwtVerify(jwt, secretKey);
};

export const verifyPasswordResetToken = async (jwt: string) => {
  const secretKey = await generatePasswordResetTokenSecretKey();
  return await jwtVerify(jwt, secretKey);
};
