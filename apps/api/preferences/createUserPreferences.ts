import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { PostResponse } from "../types";

type CreateUserPreferencesProps = {
  userId: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: CreateUserPreferencesProps }>,
  reply: FastifyReply
) => {
  const { userId } = request.query;

  try {
    const userPreferences = await db.userPreference.create({
      data: {
        userId: userId,
      },
    });

    return reply.code(200).send(userPreferences);
  } catch (error) {
    return reply.code(500).send({
      status: 500,
      message: "Internal server error",
    } as PostResponse<null>);
  }
};

const schema = {
  query: {
    type: "object",
    properties: {
      userId: { type: "string" },
    },
    required: ["userId"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        id: { type: "string" },
        userId: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        notificationsEnabled: { type: "boolean" },
      },
      required: ["id", "userId", "createdAt", "notificationsEnabled"],
    },
  },
  500: {
    type: "object",
    properties: {
      status: { type: "number" },
      message: { type: "string" },
    },
    required: ["status", "message"],
  },
};

export const createUserPreferencesRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/createUserPreferences",
  onRequest: validateJWT,
  schema,
  handler,
};
