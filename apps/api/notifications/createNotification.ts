import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, NotificationOption } from "@pathize/db";
import { validateJWT } from "../lib";
import { PostResponse } from "../types";

type CreateNotificationPreferenceProps = {
  userId: string;
  option: NotificationOption;
  enabled: boolean;
  value: number | null;
};

const handler = async (
  request: FastifyRequest<{
    Querystring: CreateNotificationPreferenceProps;
  }>,
  reply: FastifyReply
) => {
  try {
    const { userId, option, value, enabled } = request.query;
    const createdNotificationPreference = await db.notification.create({
      data: {
        userId: userId,
        option: option,
        value: value,
        enabled: enabled,
      },
    });

    return reply.status(200).send(createdNotificationPreference);
  } catch (err) {
    console.error(err);
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as PostResponse<null>);
  }
};

const schema = {
  querystring: {
    type: "object",
    properties: {
      userId: { type: "string" },
      option: { type: "string", enum: ["MAXHR", "MINHR", "HR_LIMIT"] },
      value: { type: "number" },
      enabled: { type: "boolean" },
    },
    required: ["userId", "option", "enabled"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        id: { type: "string" },
        userId: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        option: { type: "string" },
        enabled: { type: "boolean" },
        value: { type: "number" },
      },
      required: ["id", "userId", "createdAt", "option", "enabled"],
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

export const createNotificationRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/createNotification",
  onRequest: validateJWT,
  schema,
  handler,
};
