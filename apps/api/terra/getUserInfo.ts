import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { TerraUser } from "terra-api";
import { validateJWT } from "../lib/validateJwt";

import { TerraSubscriptionsResponse } from "terra-api/lib/cjs/API/Subscribers";
import { getTerraEnv } from "./utils";
import { GetResponse } from "../types";

type Props = {
  userId: string;
  provider: "APPLE";
  terraUserId?: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  const terra = getTerraEnv();
  const { provider } = request.query;
  try {
    const userInfo: TerraSubscriptionsResponse = await terra.getUsers();
    const user = userInfo.users.find((user) => user.provider === provider);

    reply.code(200).send(user as TerraUser);
  } catch (err) {
    console.log(err);
    reply.code(500).send({ status: 500, message: err } as GetResponse<null>);
  }
};

const schema = {
  querystring: {
    type: "object",
    properties: {
      userId: { type: "string" },
      provider: { type: "string", enum: ["APPLE"] },
      terraUserId: { type: "string" },
    },
    required: ["userId", "provider"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        user_id: { type: "string" },
        provider: { type: "string" },
        last_webhook_update: { type: "string" },
      },
      required: ["user_id", "provider", "last_webhook_update"],
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

export const getTerraUserInfoRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getUserInfo",
  schema,
  onRequest: validateJWT,
  handler,
};
