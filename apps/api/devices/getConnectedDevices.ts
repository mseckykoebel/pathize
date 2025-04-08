import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, DeviceConnection, DeviceResource } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { GetResponse } from "../types";

type Props = {
  userId: string;
  resource?: DeviceResource;
};

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  const { userId, resource } = request.query;
  try {
    const response = await db.deviceConnection.findFirst({
      where: {
        userId: userId,
        ...(resource && { resource: resource }),
      },
    });

    if (!response) {
      return reply.code(404).send({
        status: 404,
        message: "No devices found",
      } as GetResponse<null>);
    }

    return reply.code(200).send({
      status: 200,
      message: "OK",
      data: response,
    } as GetResponse<DeviceConnection>);
  } catch (err) {
    return reply.code(500).send({
      status: 500,
      message: "Internal server error",
    } as GetResponse<null>);
  }
};

const schema = {
  querystring: {
    type: "object",
    properties: {
      userId: { type: "string" },
      resource: { type: "string" },
    },
    required: ["userId"],
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
            resource: { type: "string" },
            terraUserId: { type: "string" },
            language: { type: "string" },
            userId: { type: "string" },
            historicalData: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["id", "resource", "terraUserId", "userId", "createdAt"],
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

export const getConnectedDevicesRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getConnectedDevices",
  schema,
  onRequest: validateJWT,
  handler,
};
