import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, AccessToken, JWTError } from "@pathize/db";
import { JWTPayload } from "jose";
import { generateAccessToken, verifyRefreshToken } from "../lib/jwt";
import { PostResponse } from "../types";

type RefreshRequest = {
  refreshToken: string;
  userId: string;
};

const handler = async (
  request: FastifyRequest<{ Body: RefreshRequest }>,
  reply: FastifyReply,
) => {
  try {
    const { refreshToken, userId } = request.body;
    // if no refresh token is provided, return a 401
    if (!refreshToken) {
      return reply.status(401).send({
        message: "Forbidden: no refresh token provided",
        status: 401,
      } as PostResponse<null>);
    }
    // check if refresh token exists in our database
    const refreshTokens = await db.refreshToken.findMany({
      where: { userId: userId },
    });
    // check if refreshToken exists in the database call above
    if (!refreshTokens.some((e) => e.refreshToken === refreshToken)) {
      return reply.status(403).send({
        message: "Unauthorized: unable to find refresh token for this user",
        status: 403,
      } as PostResponse<null>);
    }
    try {
      // don't need the status, if it fails, it will trigger the 403 error
      await verifyRefreshToken(refreshToken);
      // define the JWT payload
      const payload: JWTPayload = {
        iss: "Pathize",
        sub: userId,
      };
      const accessToken: AccessToken = await generateAccessToken(payload);
      // if it succeeds, send access token back to the client
      return reply.status(200).send(accessToken);
    } catch (e) {
      // if the jwt is invalid, we throw an error
      reply.status(403).send({
        message: (e as JWTError).name,
        status: 403,
      } as PostResponse<null>);
      throw new Error("Invalid access token");
    }
  } catch (err) {
    console.error(err);
    return reply.status(500).send({
      message: "Internal server error",
      status: 500,
    } as PostResponse<null>);
  }
};

const usersSchema = {
  body: {
    type: "object",
    properties: {
      refreshToken: { type: "string" },
    },
    required: ["refreshToken"],
  },
  response: {
    200: {
      type: "string",
      properties: {
        accessToken: { type: "string" },
      },
      required: ["accessToken"],
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
        error: { type: "string" },
        message: { type: "string" },
      },
      required: ["error", "message"],
    },
  },
};

export const tokenRoute = {
  method: "POST" as HTTPMethods,
  url: "/token",
  usersSchema,
  handler,
};
