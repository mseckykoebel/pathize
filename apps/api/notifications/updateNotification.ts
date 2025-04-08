import { FastifyRequest, FastifyReply, HTTPMethods } from "fastify";
import { db, Notification } from "@pathize/db";
import { validateJWT } from "../lib";
import { PatchResponse } from "../types";

type Props = {
  id: string | undefined;
  userId: string;
  value: number | undefined;
  time: Date | undefined;
  enabled: boolean;
  option: Notification["option"];
};

const handler = async (
  request: FastifyRequest<{ Body: Props }>,
  reply: FastifyReply
) => {
  const { id, value, enabled, time, option, userId } = request.body;

  try {
    const updatedNotification = await db.notification.upsert({
      where: {
        id: id ?? "-1",
      },
      update: {
        ...(value && { value: value }),
        ...(time && { time: time }),
        enabled: enabled,
        option: option,
        updatedAt: new Date(),
      },
      create: {
        ...(value && { value: value }),
        ...(time && { time: time }),
        enabled: true,
        option: option,
        userId: userId,
      },
    });

    console.log(updatedNotification);

    if (!updatedNotification) {
      return reply.code(404).send({
        status: 404,
        message: "Not found",
      } as PatchResponse<null>);
    }

    return reply.code(200).send({
      status: 200,
      message: "OK",
      data: updatedNotification,
    } as PatchResponse<Notification>);
  } catch (err) {
    return reply.code(500).send({
      status: 500,
      message: "Internal server error",
    } as PatchResponse<null>);
  }
};

const schema = {
  body: {
    type: "object",
    properties: {
      id: { type: "string" },
      userId: { type: "string" },
      value: { type: "number" },
      time: { type: ["string", "null"], format: "date-time" },
      enabled: { type: "boolean" },
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
    required: ["userId", "enabled", "option"],
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
            enabled: { type: "boolean" },
            value: { type: "number" },
            time: { type: "string", format: "date-time" },
          },
          required: ["id", "userId", "createdAt", "option", "enabled"],
        },
      },
      required: ["status", "message"],
    },
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
};

export const updateNotificationRoute = {
  method: "PATCH" as HTTPMethods,
  url: "/api/v1/createOrUpdateNotification",
  onRequest: validateJWT,
  handler,
  schema,
};
