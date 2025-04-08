import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { PostHog } from "posthog-node";
import { JWTPayload } from "jose";

import { db, OnboardingInformation } from "@pathize/db";
import { generateAccessAndRefreshTokens } from "../lib/jwt";
import { AuthResponse, RegisterResponse } from "../types";

const client = new PostHog(
  process.env.NODE_ENV === "production"
    ? "phc_6OFHL0jHPlRUviWDZGTqwVUmxgbtupJoDg3Gfjl3sfT"
    : "phc_Ba1B2mxC9eOXhzZUdHGs5XziEyyHZ6NWfE2BDrmE5Gb"
);

type CreateUserRequest = {
  email: string;
  password: string;
  user: OnboardingInformation;
  uId?: string;
};

const handler = async (
  request: FastifyRequest<{ Body: CreateUserRequest }>,
  reply: FastifyReply
) => {
  const { email, password, user, uId } = request.body;

  console.log(user.phoneNumber);

  try {
    const createdUser = await db.user.create({
      data: {
        ...(uId ? { id: uId } : {}),
        email: email,
        password: password,
        dateOfBirth: user.dateOfBirth,
        emailNotifications: user.emailNotifications,
        acceptedTerms: user.termsAndConditions,
        firstName: user.firstName,
        phoneNumber: String(user.phoneNumber),
      },
    });

    if (!createdUser)
      return reply.status(500).send({
        status: 500,
        message: "Error: user not created",
      } as AuthResponse<RegisterResponse>);

    // now, we can generate tokens for this user
    // id and uId are the same, this is in case uId is not included
    const { id } = createdUser;
    // define the JWT payload
    const payload: JWTPayload = {
      iss: "Pathize",
      sub: id,
    };
    // generate and sign the JWT
    const { accessToken, refreshToken } =
      await generateAccessAndRefreshTokens(payload);
    const uuid = id;
    // identify the user in posthog
    client.identify({
      distinctId: uuid,
      properties: {
        email: email,
        firstName: user.firstName,
        dateOfBirth: user.dateOfBirth,
        emailNotifications: user.emailNotifications,
        acceptedTerms: user.termsAndConditions,
        phoneNumber: user.phoneNumber,
      },
    });

    // if there exists user.illness, save a new illness record
    if (user.illness) {
      // loop through the illnesses
      for (const illness of user.illness) {
        const createdIllness = await db.illness.create({
          data: {
            name: illness.name,
            infectionDate: new Date(illness.dateOfOnset + " 1"),
            userId: id,
          },
        });

        if (!createdIllness) {
          return reply.status(500).send({
            status: 500,
            message: "Error: illness not created",
          } as AuthResponse<null>);
        }
      }
    }

    await db.refreshToken.create({
      data: {
        refreshToken: refreshToken,
        userId: id,
      },
    });

    reply.status(200).send({
      status: 200,
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    } as AuthResponse<RegisterResponse>);
    return await client.shutdownAsync();
  } catch (err) {
    console.error(err);
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as AuthResponse<null>);
  }
};

const schema = {
  body: {
    type: "object",
    properties: {
      email: { type: "string" },
      password: { type: "string" },
      uId: { type: "string" },
      user: {
        type: "object",
      },
    },
    required: ["email", "password", "user"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "number" },
        data: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
          },
        },
      },
      required: ["status", "data"],
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

export const createUserRoute = {
  method: "PUT" as HTTPMethods,
  url: "/createUser",
  schema,
  handler,
};
