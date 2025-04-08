import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { CreatePageResponse } from "@notionhq/client/build/src/api-endpoints";
import crypto from "crypto";

import { db } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { getNotionEnv } from "./getNotionEnv";

type Props = {
  userId: string;
  message: string;
}

const handler = async (
  request: FastifyRequest<{
    Body: Props;
  }>,
  reply: FastifyReply,
) => {
  const { notion, databaseId } = getNotionEnv();
  const { userId, message } = request.body;

  try {
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return reply.status(404).send({
        status: 404,
        message: "User not found",
      });
    }

    const userEmail = user.email;
    const listUsersResponse: CreatePageResponse = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        id: {
          title: [
            {
              type: "text",
              text: {
                content: crypto.randomBytes(16).toString("hex"),
              },
            },
          ],
        },
        "date created": {
          date: {
            start: new Date().toISOString(),
          },
        },
        email: {
          email: userEmail,
        },
        message: {
          rich_text: [
            {
              type: "text",
              text: {
                content: message,
              },
            },
          ],
        },
      },
    });

    reply.code(200).send({
      status: 200,
      data: listUsersResponse,
    });
  } catch (err) {
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

const schema = {
  body: {
    type: "object",
    properties: {
      userId: { type: "string" },
      message: { type: "string" },
    },
    required: ["userId", "message"],
  },
};

export const contactUsRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/contactUs",
  onRequest: validateJWT,
  handler,
  schema,
};
