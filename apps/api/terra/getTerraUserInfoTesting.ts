import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { getTerraEnv } from "./utils";
import { GetResponse } from "../types";

const handler = async (request: FastifyRequest, reply: FastifyReply) => {
  const terra = getTerraEnv();
  try {
    const userInfo = await terra.getUsers();
    reply.code(200).send(userInfo);
  } catch (err) {
    console.log(err);
    reply.code(500).send({ status: 500, message: err } as GetResponse<null>);
  }
};

const schema = {
  response: {
    200: {
      type: "object",
      properties: {
        users: {
          type: "array",
          items: { $ref: "#/$defs/user" },
        },
      },
      $defs: {
        user: {
          type: "object",
          required: ["user_id", "provider", "last_webhook_update"],
          properties: {
            user_id: { type: "string" },
            provider: { type: "string" },
            last_webhook_update: { type: "string" },
          },
        },
      },
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

export const getTerraUserInfoTesting = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getUserInfoTesting",
  schema,
  handler,
};
