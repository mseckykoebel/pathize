import OpenAI, { ClientOptions } from "openai";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const options: ClientOptions = {
  apiKey: process.env.OPENAI_SECRET_KEY || "",
  organization: process.env.OPENAI_ORGANIZATION_ID || "",
};

const openai = new OpenAI(options);

export { openai };
