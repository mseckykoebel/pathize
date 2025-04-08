import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { db } from "@pathize/db";
import { AuthResponse } from "../types";

type Props = {
  email: string;
};

const handler = async (
  request: FastifyRequest<{ Body: Props }>,
  reply: FastifyReply
) => {
  const { email } = request.body;
  try {
    const users = await db.user.findMany({
      where: {
        email: email,
      },
    });

    // if this user exists, return
    if (users.length !== 0) {
      return reply.status(409).send({
        status: 409,
        message: "User already exists",
      } as AuthResponse<null>);
    }

    console.log(users);

    // return a 200
    return reply.status(200).send({
      status: 200,
      message: "Valid email, user does not exist",
    } as AuthResponse<null>);
  } catch (err) {
    console.error(err);
    return reply.status(500).send({
      status: 500,
      message: "Internal server error",
    } as AuthResponse<null>);
  }
};

const schema = {
  body: {
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
    409: {
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

export const validateNewUserRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/validateNewUser",
  schema,
  handler,
};
