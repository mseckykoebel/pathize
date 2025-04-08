import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, UserActivity } from "@pathize/db";
import { PostResponse } from "../../types";
import { validateJWT } from "../../lib";

type Props = {
  userId: string;
  activityIcon: string;
  activityName: string;
  activityId?: string;
  activityPriority?: number;
  notes?: string;
};

const handler = async (
  request: FastifyRequest<{
    Body: Props;
  }>,
  reply: FastifyReply,
) => {
  const {
    userId,
    activityId,
    activityIcon,
    activityName,
    activityPriority,
    notes,
  } = request.body;

  try {
    // check to see if there is a userMedication in the DB that has this medicationName
    const userActivityWithSameName = await db.userActivity.findFirst({
      where: {
        userId: userId,
        activityName: activityName,
      },
    });

    if (userActivityWithSameName) {
      return reply.status(400).send({
        status: 400,
        message: "Activity with this name exists already.",
      } as PostResponse<null>);
    }

    const createdUserActivity = await db.userActivity.create({
      data: {
        userId: userId,
        activityId: activityId,
        activityIcon: activityIcon,
        activityName: activityName,
        activityPriority: activityPriority,
        notes: notes,
      },
    });

    return reply.status(200).send({
      status: 200,
      data: createdUserActivity,
    } as PostResponse<UserActivity>);
  } catch (err) {
    reply.status(500).send({
      status: 500,
      message: "Internal Server Error",
    } as PostResponse<null>);
  }
};

const schema = {
  body: {
    type: "object",
    properties: {
      userId: { type: "string" },
      activityId: { type: "string" },
      activityIcon: { type: "string" },
      activityName: { type: "string" },
      activityPriority: { type: "number" },
      notes: { type: "string" },
    },
    required: ["userId", "activityIcon", "activityName"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "number" },
        data: {
          type: "object",
          properties: {
            id: { type: "string" },
            userId: { type: "string" },
            activityId: { type: "string" },
            activityIcon: { type: "string" },
            activityName: { type: "string" },
            activityPriority: { type: "number" },
            notes: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: [
            "id",
            "userId",
            "activityIcon",
            "activityName",
            "createdAt",
          ],
        },
      },
      required: ["status", "data"],
    },
    400: {
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

export const createUserActivityRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/createUserActivity",
  onRequest: validateJWT,
  schema,
  handler,
};
