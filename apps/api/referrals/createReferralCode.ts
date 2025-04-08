import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, ReferralCode } from "@pathize/db";

import { validateJWT } from "../lib/validateJwt";
import { PostResponse } from "../types";
import { generateCode } from "./generateCode";

type Props = {
  userId: string;
}

const handler = async (
  request: FastifyRequest<{
    Querystring: Props;
  }>,
  reply: FastifyReply
) => {
  const { userId } = request.query;

  try {
    const newReferralCode = await generateCode();
    const createdReferralCode = await db.referralCode.create({
      data: {
        userId: userId,
        code: newReferralCode,
        createdAt: new Date(),
      },
    });

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: createdReferralCode,
    } as PostResponse<ReferralCode>);
  } catch (err) {
    reply.code(500).send({
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
            userId: { type: "string" },
            code: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["id", "userId", "code", "createdAt"],
        },
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

export const createReferralCodeRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/createReferralCode",
  onRequest: validateJWT,
  handler,
  schema,
};
