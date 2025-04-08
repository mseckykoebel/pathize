import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { validateJWT } from "../lib/validateJwt";
import { Activity, SearchResponse } from "../types";
import { db, ActivityDb } from "@pathize/db";

const filteredActivities = (
  searchQuery: string,
  pathizeActivities: ActivityDb[]
): Activity[] => {
  const searchField = searchQuery.toLowerCase();

  // every property in ActivityDb is defined
  return pathizeActivities
    .filter(
      (activity) => activity.activityName?.toLowerCase().includes(searchField)
    )
    .map(
      (activity) =>
        ({
          id: activity.id,
          name: activity.activityName,
          icon: activity.activityCategory,
        }) as Activity
    );
};

type Props = { query: string };

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  const { query } = request.query;

  try {
    const pathizeActivities: ActivityDb[] = await db.activityDb.findMany();
    const allActivities: Activity[] = filteredActivities(
      query,
      pathizeActivities
    );

    return reply.status(200).send({
      status: 200,
      data: allActivities,
    } as SearchResponse<Activity>);
  } catch (err) {
    reply.status(500).send({
      status: 500,
      message: "Internal Server Error",
    } as SearchResponse<Activity>);
  }
};

const schema = {
  query: {
    type: "object",
    properties: {
      query: { type: "string" },
    },
    required: ["query"],
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
              name: { type: "string" },
              icon: { type: "string" },
            },
            required: ["id", "name", "icon"],
          },
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

export const searchActivitiesFromDbRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/searchActivitiesFromDb",
  onRequest: validateJWT,
  schema,
  handler,
};
