import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { validateJWT } from "../lib/validateJwt";
import { TerraWidgetResponse } from "terra-api/lib/esm/API/GenerateWidgetSessions";

import { getTerraEnv } from "./utils";
import { GetResponse } from "../types";

type Props = {
  userId: string;
  google: string;
  fitbit: string;
  garmin: string;
  polar: string;
  apple: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  const terra = getTerraEnv();
  const { userId, google, fitbit, garmin, polar, apple } = request.query;

  try {
    const providers = [];
    if (!JSON.parse(google)) providers.push("GOOGLE");
    if (!JSON.parse(fitbit)) providers.push("FITBIT");
    if (!JSON.parse(garmin)) providers.push("GARMIN");
    if (!JSON.parse(polar)) providers.push("POLAR");
    if (!JSON.parse(apple)) providers.push("APPLE");

    const widgetSession: TerraWidgetResponse =
      await terra.generateWidgetSession({
        referenceID: userId,
        language: "EN",
        providers: providers,
        authSuccessRedirectUrl: "jdxms://profile/devices",
        authFailureRedirectUrl: "jdxms://profile/devices",
      });
    reply.code(200).send({
      status: 200,
      message: "OK",
      data: widgetSession,
    } as GetResponse<TerraWidgetResponse>);
  } catch (err) {
    console.log("Error generating widget session: ", err);
    reply.code(500).send({ status: 500, message: err } as GetResponse<null>);
  }
};

const schema = {
  querystring: {
    type: "object",
    properties: {
      userId: { type: "string" },
      google: { type: "string" },
      fitbit: { type: "string" },
      garmin: { type: "string" },
      polar: { type: "string" },
      apple: { type: "string" },
    },
    required: ["userId", "google", "fitbit", "garmin", "polar", "apple"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
        data: {
          properties: {
            session_id: { type: "string" },
            status: { type: "string" },
            url: { type: "string" },
          },
          required: ["session_id", "status", "url"],
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
export const generateWidgetSessionRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/generateWidgetSession",
  schema,
  onRequest: validateJWT,
  handler,
};
