import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, DeviceResource } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { DeleteResponse } from "../types";

type Props = {
  id: string;
  userId: string;
  resource?: DeviceResource;
};

const handler = async (
  request: FastifyRequest<{
    Querystring: Props;
  }>,
  reply: FastifyReply
) => {
  const { id, resource, userId } = request.query;

  try {
    await db.deviceConnection.delete({
      where: {
        id: id,
      },
    });
    // now, let's remove all the cache records
    await db.dailyData.deleteMany({
      where: {
        ...(resource && { resource: resource }),
        userId: userId,
      },
    });
    // remove all of the sleep records
    await db.sleepData.deleteMany({
      where: {
        ...(resource && { resource: resource }),
        userId: userId,
      },
    });

    return reply.status(204).send();
  } catch (err) {
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as DeleteResponse);
  }
};

const schema = {
  querystring: {
    type: "object",
    properties: {
      id: { type: "string" },
      resource: {
        type: "string",
        enum: ["FITBIT", "GARMIN", "GOOGLE", "POLAR", "APPLE", "OURA"],
      },
      userId: { type: "string" },
    },
    required: ["id", "userId"],
  },
  response: {
    204: {
      type: "object",
      properties: {},
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

export const deleteDeviceRoute = {
  method: "DELETE" as HTTPMethods,
  url: "/api/v1/disconnectDevice",
  schema,
  onRequest: validateJWT,
  handler,
};
