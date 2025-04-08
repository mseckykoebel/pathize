import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, UserPreference } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { GetResponse } from "../types";

type GetUserPreferencesProps = {
  userId: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: GetUserPreferencesProps }>,
  reply: FastifyReply
) => {
  const { userId } = request.query;

  try {
    // get all of the notification preferences as part of this users account
    const userPreferences = await db.userPreference.findUnique({
      where: {
        userId: userId,
      },
    });

    // if the length is 0, then the user has no notification preferences, and return a 404
    if (!userPreferences) {
      return reply.code(404).send({
        status: 404,
        message: "No notification preferences found",
      } as GetResponse<null>);
    }

    // return the notification preferences
    return reply.code(200).send({
      status: 200,
      message: "OK",
      data: userPreferences,
    } as GetResponse<UserPreference>);
  } catch (error) {
    return reply.code(500).send({
      status: 500,
      message: "Internal server error",
    } as GetResponse<null>);
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
        status: { type: "number" },
        message: { type: "string" },
        data: {
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
      required: ["status", "message"],
    },
    404: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },
      required: ["status", "message"],
    },
    500: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },
      required: ["status", "message"],
    },
  },
};

export const getUserPreferencesRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getUserPreferences",
  onRequest: validateJWT,
  schema,
  handler,
};
