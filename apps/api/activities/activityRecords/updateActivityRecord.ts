import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { ActivityRecord, db } from "@pathize/db";
import { validateJWT } from "../../lib/validateJwt";
import { PatchResponse } from "../../types";

type Props = {
  id: string;
  time: string;
  notes?: string;
  activityTotalTime?: number;
};

const handler = async (
  request: FastifyRequest<{
    Body: Props;
  }>,
  reply: FastifyReply
) => {
  const { id, time, notes, activityTotalTime } = request.body;
  try {
    const updatedActivityRecord = await db.activityRecord.update({
      where: { id: id },
      data: {
        time: time,
        notes: notes,
        activityTotalTime: activityTotalTime,
        updatedAt: new Date(),
      },
    });

    return reply.status(200).send({
      status: 200,
      data: updatedActivityRecord,
    } as PatchResponse<ActivityRecord>);
  } catch (err) {
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as PatchResponse<ActivityRecord>);
  }
};

const schema = {
  body: {
    type: "object",
    properties: {
      id: { type: "string" },
      time: { type: "string" },
      notes: { type: "string" },
    },
    required: ["id", "time"],
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

export const updateActivityRecordRoute = {
  method: "PATCH" as HTTPMethods,
  url: "/api/v1/updateActivityRecord",
  onRequest: validateJWT,
  handler,
  schema,
};
