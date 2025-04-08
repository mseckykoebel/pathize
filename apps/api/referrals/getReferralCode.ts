import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, ReferralCode } from "@pathize/db";

import { validateJWT } from "../lib/validateJwt";
import { GetResponse } from "../types";

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
    const referralCode = await db.referralCode.findFirst({
      where: {
        userId: userId,
      },
    });

    // if null, return a 404
    if (!referralCode) {
      return reply.status(404).send({
        status: 404,
        message: "Referral code not found",
      } as GetResponse<ReferralCode>);
    }

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: referralCode,
    } as GetResponse<ReferralCode>);
  } catch (err) {
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as GetResponse<null>);
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

export const getReferralCodeRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getReferralCode",
  handler,
  schema,
  preHandler: validateJWT,
};
