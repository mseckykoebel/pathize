import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { db } from "@pathize/db";
import { DeleteResponse } from "../types";
import { validateJWT } from "../lib";
import { getTerraEnv } from "../terra/utils";

type Props = {
  userId: string;
}

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  const { userId } = request.query;
  const terra = getTerraEnv();

  try {
    const deviceConnections = await db.deviceConnection.findMany({
      where: {
        userId: userId,
      },
    });
    // for each, call await terra.deauthUser with terraUserId as the argument
    for (const deviceConnection of deviceConnections) {
      await terra.deauthUser(deviceConnection.terraUserId);
    }
    // finally, delete the user from the database, and with them, all associated records
    await db.user.delete({
      where: {
        id: userId,
      },
    });

    return reply.status(204).send();
  } catch (err) {
    console.log("Error deleting account: ", err);
    return reply.status(500).send({
      status: 500,
      message: "Internal server error",
    } as DeleteResponse);
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
    204: {
      type: "object",
      properties: {},
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

export const deleteAccountRoute = {
  method: "DELETE" as HTTPMethods,
  url: "/api/v1/deleteAccount",
  onRequest: validateJWT,
  handler,
  schema,
};
