import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { Referrals, db } from "@pathize/db";

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
    // get all referrals where refereeUserId is userId
    const referrals = await db.referrals.findMany({
      where: {
        referrerUserId: userId,
      },
    });

    if (referrals.length === 0) {
      return reply.status(404).send({
        status: 404,
        message: "No referral records found",
      } as GetResponse<null>);
    }

    return reply.status(200).send({
      status: 404,
      message: "OK",
      data: referrals,
    } as GetResponse<Referrals>);
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
      referralCode: { type: "string" },
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
          type: "array",
          items: {
            id: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            referrerUserId: { type: "string" },
            refereeUserId: { type: "string" },
            referrerReferralCode: { type: "string" },
          },
          required: [
            "id",
            "createdAt",
            "referrerUserId",
            "refereeUserId",
            "referrerReferralCode",
          ],
        },
      },
    },
    400: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },
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

export const getReferralsByRefereeRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getReferralsByReferrer",
  handler,
  schema,
  onRequest: validateJWT,
};
