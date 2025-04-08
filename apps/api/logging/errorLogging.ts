import { FastifyRequest, FastifyReply, HTTPMethods } from "fastify";
import { validateJWT } from "../lib/validateJwt";
import { PostResponse } from "../types";

type Props = {
  userId: string;
  message: string;
};

const handler = async (
  request: FastifyRequest<{
    Querystring: Props;
  }>,
  reply: FastifyReply
) => {
  try {
    const { userId, message } = request.query;

    console.log("USER ID:", userId);
    console.log("MESSAGE: ", message);

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: `Message received: ${JSON.stringify(message)}`,
    } as PostResponse<string>);
  } catch (err) {
    return reply.status(500).send({
      status: 500,
      message: "Internal Server Error",
    } as PostResponse<null>);
  }
};

const schema = {
  querystring: {
    type: "object",
    properties: {
      userId: { type: "string" },
      message: { type: "string" },
    },
    required: ["userId", "message"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
        data: { type: "string" },
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

export const errorLoggingRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/logging",
  onRequest: validateJWT,
  schema,
  handler,
};
