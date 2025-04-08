import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { UserActivity, db } from "@pathize/db";
import { validateJWT } from "../../lib/validateJwt";
import { PatchResponse } from "../../types";

type Props = {
  id: string;
  activityId?: string;
  notes?: string;
  activityIcon: string;
  activityPriority?: number;
  activityName: string;
}

const handler = async (
  request: FastifyRequest<{
    Body: Props;
  }>,
  reply: FastifyReply,
) => {
  const {
    id,
    activityId,
    notes,
    activityIcon,
    activityPriority,
    activityName,
  } = request.body;

  try {
    const updatedUserActivity = await db.userActivity.update({
      where: { id: id },
      data: {
        activityId: activityId,
        notes: notes,
        activityIcon: activityIcon,
        activityPriority: activityPriority,
        activityName: activityName,
        updatedAt: new Date(),
      },
    });

    // NOW WE NEED TO UPDATE ALL THE ACTIVITY RECORDS THAT HAVE THIS USER ACTIVITY ID
    // GET ALL THE RECORDS AND UPDATE THEM
    const activityRecords = await db.activityRecord.findMany({
      where: {
        userActivityId: id,
      },
    });

    // UPDATE THEM ALL IN PARALLEL
    activityRecords.forEach(async (record) => {
      await db.activityRecord.update({
        where: { id: record.id },
        data: {
          ...record,
          activityIcon: activityIcon,
          activityName: activityName,
          activityPriority: activityPriority,
          updatedAt: new Date(),
        },
      });
    });

    return reply.status(200).send({
      status: 200,
      data: updatedUserActivity,
    } as PatchResponse<UserActivity>);
  } catch (err) {
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as PatchResponse<null>);
  }
};

const schema = {
  body: {
    type: "object",
    properties: {
      id: { type: "string" },
      activityId: { type: "string" },
      notes: { type: "string" },
      activityIcon: { type: "string" },
      activityPriority: { type: "number" },
      activityName: { type: "string" },
    },
    required: ["id", "activityIcon", "activityName"],
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
            notes: { type: "string" },
            activityIcon: { type: "string" },
            activityPriority: { type: "number" },
            activityName: { type: "string" },
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

export const updateUserActivityRoute = {
  method: "PATCH" as HTTPMethods,
  url: "/api/v1/updateUserActivity",
  onRequest: validateJWT,
  handler,
  schema,
};
