import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { FcmToken, db } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { PatchResponse } from "../types";

type Props = {
  id: string;
  token: string;
};

const handler = async (
  request: FastifyRequest<{
    Querystring: Props;
  }>,
  reply: FastifyReply
) => {
  const { id, token } = request.query;

  try {
    const updateToken = await db.fcmToken.update({
      where: {
        id: id,
      },
      data: {
        token: token,
        updatedAt: new Date(),
      },
    });

    // if not found return a 404
    if (!updateToken) {
      return reply.status(404).send({
        status: 404,
        message: "Token not found",
      } as PatchResponse<null>);
    }

    return reply.status(200).send({
      status: 200,
      message: "Token updated successfully",
      data: updateToken,
    } as PatchResponse<FcmToken>);
  } catch (err) {
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
      token: { type: "string" },
    },
    required: ["id", "token"],
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
            userId: { type: "string" },
            token: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["id", "userId", "token", "createdAt", "updatedAt"],
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

export const updateFcmTokenRoute = {
  method: "PATCH" as HTTPMethods,
  url: "/api/v1/updateFcmToken",
  onRequest: validateJWT,
  handler,
  schema,
};
