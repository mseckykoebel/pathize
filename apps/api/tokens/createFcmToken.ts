import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { FcmToken, db } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { PostResponse } from "../types";

type Props = {
  Body: {
    userId: string;
    token: string;
  };
};

const handler = async (request: FastifyRequest<Props>, reply: FastifyReply) => {
  try {
    const { userId, token } = request.body;

    // first, see if a token this name does not exist already for this user
    const existingToken = await db.fcmToken.findFirst({
      where: {
        userId: userId,
        token: token,
      },
    });

    if (existingToken) {
      return reply.status(200).send({
        status: 200,
        message: "Token already exists",
        data: existingToken,
      } as PostResponse<FcmToken>);
    }

    const createdToken = await db.fcmToken.create({
      data: {
        userId: userId,
        token: token,
        createdAt: new Date(),
      },
    });

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: createdToken,
    } as PostResponse<FcmToken>);
  } catch (err) {
    console.log("err", err);
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as PostResponse<null>);
  }
};

const schema = {
  body: {
    type: "object",
    properties: {
      userId: { type: "string" },
      token: { type: "string" },
    },
    required: ["userId", "token"],
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
          },
          required: ["id", "userId", "token", "createdAt"],
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

export const createFcmTokenRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/createFcmToken",
  onRequest: validateJWT,
  schema,
  handler,
};
