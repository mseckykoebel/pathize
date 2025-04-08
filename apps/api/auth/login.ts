import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { JWTPayload } from "jose";

import { db } from "@pathize/db";
import { generateAccessAndRefreshTokens } from "../lib/jwt";
import { LoginResponse, AuthResponse } from "../types";

type GetUserRequest = {
  email: string;
  password: string;
};

const handler = async (
  request: FastifyRequest<{ Body: GetUserRequest }>,
  reply: FastifyReply,
) => {
  const { email, password } = request.body;
  try {
    // because the password is encrypted, we only check for the unique email in the database
    const user = await db.user.findFirst({
      where: {
        email: email,
      },
    });
    // if no user is found, their email is not in the database
    if (!user) {
      reply.status(404).send({
        message: "User not found",
        status: 404,
      } as AuthResponse<LoginResponse>);
      return;
    }
    // if the user is found, we check the password, and if it is wrong, we return a 404
    if (user.password !== password) {
      reply.status(401).send({
        message: "Incorrect password",
        status: 401,
      } as AuthResponse<LoginResponse>);
      return;
    }
    // define the JWT payload
    const payload: JWTPayload = {
      iss: "Pathize",
      sub: user.id,
    };
    // generate and sign the JWT
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      payload,
    );
    // if this went through, save the refresh token to the database
    try {
      await db.refreshToken.create({
        data: {
          refreshToken: refreshToken,
          userId: user.id,
        },
      });
      // if it succeeds, send the access and refresh tokens back to the client
      return reply.status(200).send({
        status: 200,
        data: { accessToken, refreshToken },
      } as AuthResponse<LoginResponse>);
    } catch (e) {
      // just send a 500 if it fails
      return reply.code(500).send();
    }
  } catch (err) {
    console.error(err);
    return reply.status(500).send({
      status: 500,
      message: "Internal server error",
    } as AuthResponse<LoginResponse>);
  }
};

const usersSchema = {
  body: {
    type: "object",
    properties: {
      email: { type: "string" },
      password: { type: "string" },
    },
    required: ["email", "password"],
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
        message: { type: "string" },
        status: { type: "number" },
      },
      required: ["message", "status"],
    },
  },
};

export const loginRoute = {
  method: "POST" as HTTPMethods,
  url: "/login",
  usersSchema,
  handler,
};
