import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { db, User } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { GetResponse } from "../types";

type GetUserRequest = {
  userId: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: GetUserRequest }>,
  reply: FastifyReply,
) => {
  try {
    const { userId } = request.query;
    const user = await db.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user)
      return reply.status(404).send({
        status: 404,
        message: "User not found",
      } as GetResponse<User>);

    return reply.status(200).send({
      status: 200,
      data: user,
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
      userId: { type: "string" },
    },
    required: ["userId"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "number" },
        data: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            fcmToken: { type: "string" },
            timezoneOffset: { type: "number" },
            // info from onboarding
            firstName: { type: "string" },
            emailNotifications: { type: "boolean" },
            dateOfBirth: { type: "string" },
            gender: { type: "string" },
            illness: { type: "object" },
          },
          required: [
            "id",
            "email",
            "password",
            "createdAt",
            "firstName",
            "emailNotifications",
            "dateOfBirth",
          ],
        },
      },
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

export const getUserRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getUser",
  onRequest: validateJWT,
  schema,
  handler,
};
