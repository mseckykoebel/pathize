import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { PostHog } from "posthog-node";

import { ActivityRecord, db } from "@pathize/db";
import { validateJWT } from "../../lib/validateJwt";
import { CreateResponse } from "../../types";

const client = new PostHog(
  process.env.NODE_ENV === "production"
    ? "phc_6OFHL0jHPlRUviWDZGTqwVUmxgbtupJoDg3Gfjl3sfT"
    : "phc_Ba1B2mxC9eOXhzZUdHGs5XziEyyHZ6NWfE2BDrmE5Gb"
);

type Props = {
  userId: string;
  time: string;
  createdDay: string;
  userActivityId: string;
  notes: string | null;
  activityIcon: string;
  activityName: string;
  activityPriority?: number;
  activityTotalTime?: number;
  platform?: "iphone" | "apple_watch";
};

const handler = async (
  request: FastifyRequest<{
    Body: Props;
  }>,
  reply: FastifyReply
) => {
  const {
    userId,
    time,
    createdDay,
    userActivityId,
    notes,
    activityIcon,
    activityName,
    activityPriority,
    activityTotalTime,
    platform,
  } = request.body;

  try {
    const existingRecord = await db.activityRecord.findFirst({
      where: {
        userId: userId,
        time: time,
        createdDay: createdDay,
        notes: notes,
        activityTotalTime: activityTotalTime,
      },
    });

    if (existingRecord) {
      return reply.code(500).send({
        status: 500,
        message: "There was an issue saving a duplicate record",
      } as CreateResponse<ActivityRecord>);
    }

    const createdActivityRecord = await db.activityRecord.create({
      data: {
        userId: userId,
        time: time,
        createdDay: createdDay,
        userActivityId: userActivityId,
        notes: notes,
        activityIcon: activityIcon,
        activityName: activityName,
        activityPriority: activityPriority,
        activityTotalTime: activityTotalTime,
      },
    });

    client.capture({
      distinctId: userId,
      event: "Activity recorded",
      properties: {
        ...(platform ? { platform: platform } : { platform: "apple_watch" }),
        ...(activityTotalTime ? { activityTotalTime: activityTotalTime } : {}),
      },
    });

    return reply.status(200).send({
      status: 200,
      data: createdActivityRecord,
    } as CreateResponse<ActivityRecord>);
  } catch (err) {
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as CreateResponse<ActivityRecord>);
  }
};

const schema = {
  body: {
    type: "object",
    properties: {
      userId: { type: "string" },
      time: { type: "string" },
      createdDay: { type: "string" },
      userActivityId: { type: "string" },
      notes: { type: "string" },
      activityIcon: { type: "string" },
      activityName: { type: "string" },
      activityPriority: { type: "number" },
      activityTotalTime: { type: "number" },
      platform: { type: "string" }, // iphone | apple watch
    },
    required: [
      "userId",
      "time",
      "createdDay",
      "userActivityId",
      "activityIcon",
      "activityName",
    ],
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

export const createActivityRecordRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/createActivityRecord",
  onRequest: validateJWT,
  handler,
  schema,
};
