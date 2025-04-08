import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, DeviceResource } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { CreateResponse } from "../types";

type Props = {
  resource: DeviceResource;
  terraUserId: string;
  userId: string;
}

const handler = async (
  request: FastifyRequest<{
    Body: Props;
  }>,
  reply: FastifyReply
) => {
  try {
    const { resource, terraUserId, userId } = request.body;

    // bug with terra - they do not send 'en' correctly
    const createdDevice = await db.deviceConnection.create({
      data: {
        resource: resource,
        terraUserId: terraUserId,
        language: "en",
        userId: userId,
      },
    });

    return reply.status(200).send(createdDevice);
  } catch (err) {
    console.log("createDeviceConnection error: ", err);
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as CreateResponse<null>);
  }
};

const schema = {
  body: {
    type: "object",
    properties: {
      resource: { type: "string" },
      terraUserId: { type: "string" },
      userId: { type: "string" },
    },
    required: ["resource", "terraUserId", "userId"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        id: { type: "string" },
        resource: { type: "string" },
        terraUserId: { type: "string" },
        language: { type: "string" },
        userId: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
      required: [
        "id",
        "resource",
        "terraUserId",
        "language",
        "userId",
        "createdAt",
        "updatedAt",
      ],
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

export const createDeviceConnectionRoute = {
  method: "PUT" as HTTPMethods,
  url: "/api/v1/createDeviceConnection",
  onRequest: validateJWT,
  schema,
  handler,
};
