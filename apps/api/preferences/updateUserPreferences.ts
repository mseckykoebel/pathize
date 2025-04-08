import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, UserPreference } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { PatchResponse } from "../types";

type UpdateUserPreferencesProps = {
  userId: string;
  notificationsEnabled: boolean;
};

const handler = async (
  request: FastifyRequest<{ Querystring: UpdateUserPreferencesProps }>,
  reply: FastifyReply
) => {
  const { userId, notificationsEnabled } = request.query;

  try {
    const userPreferences = await db.userPreference.update({
      where: {
        userId: userId,
      },
      data: {
        notificationsEnabled: notificationsEnabled,
        updatedAt: new Date(),
      },
    });

    return reply.code(200).send({
      status: 200,
      message: "OK",
      data: userPreferences,
    } as PatchResponse<UserPreference>);
  } catch (error) {
    return reply.code(500).send({
      status: 500,
      message: "Internal server error",
    } as PatchResponse<null>);
  }
};

const schema = {
  query: {
    type: "object",
    properties: {
      userId: { type: "string" },
      notificationsEnabled: { type: "boolean" },
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
          properties: {
            id: { type: "string" },
            userId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            notificationsEnabled: { type: "boolean" },
          },
          required: [
            "id",
            "userId",
            "createdAt",
            "updatedAt",
            "notificationsEnabled",
          ],
        },
      },
      required: ["status", "data"],
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

export const updateUserPreferencesRoute = {
  method: "PATCH" as HTTPMethods,
  url: "/api/v1/updateUserPreferences",
  onRequest: validateJWT,
  handler,
  schema,
};
