import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, Referrals } from "@pathize/db";

import { validateJWT } from "../lib/validateJwt";
import { PostResponse } from "../types";

type Props = {
  referrerUserId: string;
  refereeUserId: string;
  referrerReferralCode: string;
}

const handler = async (
  request: FastifyRequest<{
    Querystring: Props;
  }>,
  reply: FastifyReply
) => {
  const { referrerUserId, refereeUserId, referrerReferralCode } = request.query;

  try {
    const createReferralRecord = await db.referrals.create({
      data: {
        referrerUserId: referrerUserId,
        refereeUserId: refereeUserId,
        referrerReferralCode: referrerReferralCode,
        createdAt: new Date(),
      },
    });

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: createReferralRecord,
    } as PostResponse<Referrals>);
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
      referrerUserId: { type: "string" },
      refereeUserId: { type: "string" },
      referrerReferralCode: { type: "string" },
    },
    required: ["referrerUserId", "refereeUserId", "referrerReferralCode"],
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
            referrerUserId: { type: "string" },
            refereeUserId: { type: "string" },
            referrerReferralCode: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
          required: [
            "id",
            "referrerUserId",
            "refereeUserId",
            "referrerReferralCode",
            "createdAt",
          ],
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

export const createReferralRecordRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/createReferralRecord",
  onRequest: validateJWT,
  handler,
  schema,
};
