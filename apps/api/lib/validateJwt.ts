import { requestContext } from "@fastify/request-context";
import { JWTError } from "@pathize/db";
import { FastifyReply, FastifyRequest } from "fastify";

import { verifyAccessToken } from "./jwt";

// Extend RequestContextData type here (https://github.com/fastify/fastify-request-context/issues/159)
declare module "@fastify/request-context" {
  interface RequestContextData {
    [key: string]: unknown;
  }
}

export const validateJWT = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // every request must include an access token in order to get resources, other things from the API
  if (!request.headers.authorization) {
    reply.code(401);
    throw new Error("All requests must be authenticated.");
  }

  // some access token we get from a client - has to be validated
  let jwt: string = request.headers.authorization;

  // remove "Bearer" from the token
  if (jwt.indexOf("Bearer") !== -1) {
    jwt = jwt.replace("Bearer ", "");
  }

  // validate jwt
  let accessTokenJwt;
  try {
    accessTokenJwt = await verifyAccessToken(jwt);
  } catch (e) {
    // if the jwt is invalid, we attempt to refresh it
    reply.status(403).send({ message: (e as JWTError).name, status: 403 });
    console.log("Error: JWT is invalid");
  }

  // TODO: check if we need to refresh

  requestContext.set("accessToken", accessTokenJwt);
};
