import Terra from "terra-api";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

export function getTerraEnv() {
  if (
    !process.env.TERRA_DEV_ID ||
    !process.env.TERRA_API_KEY ||
    !process.env.TERRA_SIGNING_SECRET
  ) {
    throw new Error("Missing Terra credentials in environment") as never;
  }

  return new Terra(
    process.env.TERRA_DEV_ID,
    process.env.TERRA_API_KEY,
    process.env.TERRA_SIGNING_SECRET,
  );
}
