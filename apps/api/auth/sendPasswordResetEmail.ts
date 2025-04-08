import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { APIClient, SendEmailRequest } from "customerio-node";
import { JWTPayload } from "jose";

import { db } from "@pathize/db";
import { generatePasswordResetToken } from "../lib/jwt";
import { PostResponse } from "../types";

// throw an error if process.env.CIO_API_KEY_1 is not defined
if (!process.env.CIO_API_KEY_1) {
  throw new Error("CIO_API_KEY_1 is not defined");
}

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://jupiter-api.fly.dev"
    : process.env.NODE_ENV === "staging"
      ? "https://jupiter-api-staging.fly.dev"
      : "http://localhost:3000";

type Props = {
  email: string;
}

const handler = async (
  request: FastifyRequest<{ Body: Props }>,
  reply: FastifyReply,
) => {
  const { email } = request.body;
  const client = new APIClient(process.env.CIO_API_KEY_1 as string);
  try {
    const user = await db.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user)
      return reply.status(404).send({
        status: 404,
        message: "User not found",
      } as PostResponse<null>);

    const { passwordResetToken } = await generatePasswordResetToken({
      iss: "Pathize",
      sub: email,
    } as JWTPayload);

    // save the password reset token to the user
    const createToken = await db.passwordResetToken.create({
      data: {
        passwordResetToken: passwordResetToken,
        userId: user.id,
      },
    });

    if (!createToken) {
      return reply.status(500).send({
        status: 500,
        message: "Password reset failed",
      } as PostResponse<null>);
    }

    const request = new SendEmailRequest({
      transactional_message_id: "password_reset",
      identifiers: {
        email: email,
      },
      to: email,
      headers: {
        Authorization: `Bearer ${passwordResetToken}`,
      },
      message_data: {
        password_reset_url: `${BASE_URL}/api/v1/passwordReset?token=${passwordResetToken}`,
      },
    });

    const emailMessage = await client.sendEmail(request);

    // if the result was a 200
    if (emailMessage.delivery_id) {
      return reply.status(200).send({
        status: 200,
        message: "Password reset email sent",
        data: null,
      } as PostResponse<null>);
    } else {
      return reply.status(500).send({
        status: 500,
        message:
          "Something unexpected happened. The password reset email was not sent.",
        data: null,
      } as PostResponse<null>);
    }
  } catch (err) {
    reply.status(500).send({
      message:
        "Something unexpected happened. The password reset email was not sent.",
      status: 500,
    } as PostResponse<null>);
    return;
  }
};

export const sendPasswordResetEmailRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/sendPasswordResetEmail",
  handler,
};
