import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { validateJWT } from "../../lib/validateJwt";
import { GetResponse } from "../../types";
import { db, UserActivity } from "@pathize/db";

type Props = {
  userId: string;
};

const handler = async (
  request: FastifyRequest<{
    Querystring: Props;
  }>,
  reply: FastifyReply,
) => {
  const { userId } = request.query;

  try {
    // get all of the user activities from the db
    const userActivities = await db.userActivity.findMany({
      where: {
        userId: userId,
      },
    });

    // if the length is 0, then the user has no user activity records, and return a 404
    if (userActivities.length === 0) {
      return reply.code(404).send({
        status: 404,
        message: "No user activity records found",
      } as GetResponse<null>);
    }

    return reply.status(200).send({
      status: 200,
      data: userActivities,
    } as GetResponse<UserActivity>);
  } catch (err) {
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
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
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              userId: { type: "string" },
              activityId: { type: "string" },
              activityName: { type: "string" },
              activityPriority: { type: "number" },
              activityIcon: { type: "string" },
              notes: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
            required: [
              "id",
              "userId",
              "activityName",
              "activityIcon",
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

export const getUserActivitiesRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getUserActivities",
  onRequest: validateJWT,
  schema,
  handler,
};
