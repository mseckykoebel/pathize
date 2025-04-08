import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db } from "@pathize/db";
import { validateJWT } from "../lib";
import { GetResponse } from "../types";

type Props = {
  userId: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply,
) => {
  const { userId } = request.query;

  try {
    // get all of the notification preferences as part of this users account
    const notificationPreferences = await db.notification.findMany({
      where: {
        userId: userId,
      },
    });

    // if the length is 0, then the user has no notification preferences, and return a 404
    if (notificationPreferences.length === 0) {
      return reply.code(404).send({
        status: 404,
        message: "No notification preferences found",
      } as GetResponse<null>);
    }

    // return the notification preferences
    return reply.code(200).send({
      status: 200,
      message: "OK",
      data: notificationPreferences,
    } as GetResponse<typeof notificationPreferences>);
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
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              userId: { type: "string" },
              value: { type: "number" },
              time: { type: "string", format: "date-time" },
              enabled: { type: "boolean" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
              option: {
                type: "string",
                enum: [
                  "MAXHR",
                  "MINHR",
                  "HR_LIMIT",
                  "MORNING_REMINDER",
                  "EVENING_REMINDER",
                  "ENERGY",
                ],
              },
            },
            required: ["id", "userId", "createdAt", "option", "enabled"],
          },
        },
      },
      required: ["status", "data"],
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

export const getNotificationsRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getNotifications",
  onRequest: validateJWT,
  schema,
  handler,
};
