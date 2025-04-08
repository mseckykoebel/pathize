import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

export function getNotionEnv() {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    throw new Error("Missing Notion credentials in environment") as never;
  }

  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  });
  const databaseId = process.env.NOTION_DATABASE_ID;
  return { notion, databaseId };
}
