import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { db } from "@pathize/db";
import { AuthResponse } from "../types";
import { verifyPasswordResetToken } from "../lib";

type Props = {
  email: string;
  password: string;
};

const handler = async (
  request: FastifyRequest<{ Body: Props }>,
  reply: FastifyReply,
) => {
  const { email, password } = request.body;
  const resetToken = request.headers.authorization?.split(" ")[1] as string;
  console.log(resetToken);

  try {
    // get the user by email
    const user = await db.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) {
      return reply.status(404).send({
        status: 404,
        message: "A user with this email address was not found",
      } as AuthResponse<null>);
    }
    // get all tokens associated with the userId, and see if it matches the resetToken
    const allUserTokens = await db.passwordResetToken.findMany({
      where: {
        userId: user.id,
      },
    });
    const allTokens = allUserTokens.filter((token) => {
      return token.passwordResetToken === resetToken;
    });
    if (allTokens.length === 0) {
      return reply.status(404).send({
        status: 404,
        message:
          "Something went wrong when resetting your password. Please request to have your password reset again.",
      } as AuthResponse<null>);
    }

    // verify this token
    await verifyPasswordResetToken(resetToken);

    // update the password of the user
    const updatedUser = await db.user.update({
      where: {
        email: email,
      },
      data: {
        password: password,
      },
    });

    // if the user was not updated
    if (!updatedUser) {
      return reply.status(500).send({
        status: 500,
        message: "Password reset failed",
      } as AuthResponse<null>);
    }

    // delete all tokens associated with this userId
    await db.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // success!
    return reply.status(200).send({
      status: 200,
      message: "password reset",
    } as AuthResponse<null>);
  } catch (err) {
    return reply.status(500).send({
      status: 500,
      message: "Password reset failed",
    } as AuthResponse<null>);
  }
};

const schema = {
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
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },
      required: ["status", "message"],
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

export const validatePasswordResetRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/validatePasswordReset",
  schema,
  handler,
};
