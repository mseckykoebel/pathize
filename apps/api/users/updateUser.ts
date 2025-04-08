import { db } from "@pathize/db";
import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { validateJWT } from "../lib/validateJwt";
import { PatchResponse } from "../types";

type Props = {
  userId: string;
  firstName?: string;
  email?: string;
  phoneNumber?: string;
};

const handler = async (
  request: FastifyRequest<{ Body: Props }>,
  reply: FastifyReply
) => {
  try {
    const { userId, firstName, email, phoneNumber } = request.body;
    const user = await db.user.update({
      where: { id: userId },
      data: {
        firstName: firstName,
        email: email,
        phoneNumber: phoneNumber,
        updatedAt: new Date(),
      },
    });
    if (!user) {
      return reply
        .status(404)
        .send({ message: "User not found" } as PatchResponse<null>);
    }
    return reply.status(200).send(user);
  } catch (err) {
    console.log("err", err);
    return reply.status(500).send({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

const usersSchema = {
  body: {
    type: "object",
    properties: {
      userId: { type: "string" },
      firstName: { type: "string" },
      email: { type: "string" },
    },
    required: ["userId"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        id: { type: "string" },
        email: { type: "string" },
        password: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        fcmToken: { type: "string" },
        // info from onboarding
        firstName: { type: "string" },
        emailNotifications: { type: "boolean" },
        dateOfBirth: { type: "string" },
        gender: { type: "string" },
        illness: { type: "object" },
        phoneNumber: { type: "string" },
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
    404: {
      type: "object",
      properties: {
        error: { type: "string" },
      },
      required: ["error"],
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

export const updateUserRoute = {
  method: "PATCH" as HTTPMethods,
  url: "/api/v1/updateUser",
  onRequest: validateJWT,
  usersSchema,
  handler,
};
