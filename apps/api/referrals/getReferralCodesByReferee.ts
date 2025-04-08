import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { ReferralCode, db } from "@pathize/db";

import { validateJWT } from "../lib/validateJwt";
import { GetResponse } from "../types";

type Props = {
  userId: string;
  referralCode: string;
}

const handler = async (
  request: FastifyRequest<{
    Querystring: Props;
  }>,
  reply: FastifyReply
) => {
  const { userId, referralCode } = request.query;

  try {
    // first check and see if a referralCode with this code exists in the database and
    // does not belong to the userId
    const referralCodeRecordIfCodeValid = await db.referralCode.findFirst({
      where: {
        code: referralCode,
        NOT: {
          userId: userId,
        },
      },
    });

    // if this is null, return a 400
    if (!referralCodeRecordIfCodeValid) {
      return reply.status(400).send({
        status: 400,
        message: "Invalid referral code",
      } as GetResponse<null>);
    }

    // check to see if this user has been referred before
    const referrals = await db.referrals.findMany({
      where: {
        refereeUserId: userId,
      },
    });

    // if has not been referred, return a 200
    if (referrals.length === 0) {
      return reply.status(200).send({
        status: 200,
        message: "No referrals found with this referee Id",
        data: referralCodeRecordIfCodeValid, // contains data on who the code belongs to 
      } as GetResponse<ReferralCode>);
    } else {
      // this user has been referred before
      return reply.status(400).send({
        status: 400,
        message: "User has been referred before",
      } as GetResponse<null>);
    }
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
    required: ["userId", "referralCode"],
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
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            code: { type: "string" },
            userId: { type: "string" },
          },
          required: ["id", "createdAt", "code", "userId"],
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
    500: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },
    },
  },
};

export const getReferralCodesByRefereeRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getReferralCodesByReferee",
  handler,
  schema,
  onRequest: validateJWT,
};
