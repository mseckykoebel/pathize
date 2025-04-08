import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { DeviceConnection, db } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { PatchResponse } from "../types";

type Props = {
  id: string;
  historicalData?: boolean;
}

const handler = async (
  request: FastifyRequest<{
    Querystring: Props;
  }>,
  reply: FastifyReply
) => {
  try {
    const { id, historicalData } = request.query;

    // bug with terra - they do not send 'en' correctly
    const updateDevice = await db.deviceConnection.update({
      where: {
        id: id,
      },
      data: {
        ...(historicalData && { historicalData: historicalData }),
      },
    });

    // if not found return a 404
    if (!updateDevice) {
      return reply.status(404).send({
        status: 404,
        message: "Device not found",
      } as PatchResponse<null>);
    }

    return reply.status(200).send({
      status: 200,
      message: "Device updated successfully",
      data: updateDevice,
    } as PatchResponse<DeviceConnection>);
  } catch (err) {
    console.log("createDeviceConnection error: ", err);
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as PatchResponse<null>);
  }
};

const schema = {
  query: {
    type: "object",
    properties: {
      id: { type: "string" },
      historicalData: { type: "boolean" },
    },
    required: ["id"],
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
    },
    500: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },
    },
  },
};

export const updateDeviceConnectionRoute = {
  method: "PATCH" as HTTPMethods,
  url: "/api/v1/updateDeviceConnection",
  onRequest: validateJWT,
  schema,
  handler,
};
