import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { db, User } from "@pathize/db";
import { GetResponse } from "../types";

type Props = {
  email: string;
}

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply,
) => {
  const { email } = request.query;

  try {
    const user = await db.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user)
      return reply.status(404).send({
        status: 404,
        message: "User not found",
      } as GetResponse<User>);

    return reply.status(200).send({
      status: 200,
      message: "User found",
    } as GetResponse<User>);
  } catch (err) {
    return reply.status(500).send({
      status: 500,
      message: "Internal Server Error",
    } as GetResponse<User>);
  }
};

const schema = {
  querystring: {
    type: "object",
    properties: {
      email: { type: "string" },
    },
    required: ["email"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },
      required: ["status", "message"],
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

export const getUserByEmailRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getUserByEmail",
  schema,
  handler,
};
