import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import dayjs from "dayjs";

import { ActivityRecord, db } from "@pathize/db";
import { GetResponse } from "../../types";
import { validateJWT } from "../../lib";

type Props = {
  userId: string;
  day: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  const { userId, day } = request.query;

  try {
    const activityRecords = await db.activityRecord.findMany({
      where: {
        userId: userId,
      },
    });

    if (activityRecords.length === 0) {
      return reply.code(404).send({
        status: 404,
        message: "No activity records found",
      } as GetResponse<ActivityRecord>);
    }

    const activitiesForToday = activityRecords.filter((activity) => {
      return dayjs(activity.createdDay).format("YYYY-MM-DD") === day;
    });

    if (activitiesForToday.length === 0) {
      return reply.code(404).send({
        status: 404,
        message: "No activity records found",
      } as GetResponse<ActivityRecord>);
    }

    return reply.status(200).send({
      status: 200,
      data: activitiesForToday,
    } as GetResponse<ActivityRecord>);
  } catch (err) {
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as GetResponse<ActivityRecord>);
  }
};

const schema = {
  query: {
    type: "object",
    properties: {
      userId: { type: "string" },
      day: { type: "string" },
    },
    required: ["userId", "day"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "number" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              userId: { type: "string" },
              time: { type: "string" },
              createdDay: { type: "string" },
              userActivityId: { type: "string" },
              notes: { type: "string" },
              activityIcon: { type: "string" },
              activityName: { type: "string" },
              activityPriority: { type: "number" },
              activityTotalTime: { type: "number" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
            required: [
              "id",
              "userId",
              "time",
              "createdDay",
              "userActivityId",
              "activityIcon",
              "activityName",
              "createdAt",
            ],
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

export const getActivityRecordsRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getActivityRecords",
  onRequest: validateJWT,
  handler,
  schema,
};
