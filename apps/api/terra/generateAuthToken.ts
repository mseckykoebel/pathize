import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { validateJWT } from "../lib/validateJwt";
import { TerraAuthTokenResponse } from "terra-api/lib/esm/API/GenerateAuthToken";
import { getTerraEnv } from "./utils";
import { PostResponse } from "../types";

const handler = async (_request: FastifyRequest, reply: FastifyReply) => {
  try {
    const terra = getTerraEnv();
    const authToken: TerraAuthTokenResponse = await terra.generateAuthToken();
    reply.status(200).send({
      status: 200,
      message: "OK",
      data: authToken,
    } as PostResponse<TerraAuthTokenResponse>);
  } catch (err) {
    console.log("ERROR GENERATING AUTH TOKEN: ", err);
    reply.code(500).send({ status: 500, message: err } as PostResponse<null>);
  }
};

const schema = {
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
        data: {
          properties: {
            status: { type: "string" },
            token: { type: "string" },
            expires_in: { type: "string" },
          },
          required: ["status", "token", "expires_in"],
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

export const generateAuthTokenRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/generateAuthToken",
  schema,
  onRequest: validateJWT, // auth validation
  handler,
};
