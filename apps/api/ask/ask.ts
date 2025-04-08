import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  HTTPMethods,
} from "fastify";

import type {
  WebsocketMessage,
  AssistantSocketStream,
  ActiveClients,
  WebsocketMessageType,
  WSInit,
  WSMessage,
  WSDisconnect,
  WSPing,
  WSError,
} from "../types";
import { onDisconnect, onInit, onMessage, onPing } from "./utils";
import { validateJWT } from "../lib";
import { deleteAssistant } from "./assistant";

const ACTIVE_CLIENTS: ActiveClients = {};

const handler = (_request: FastifyRequest, reply: FastifyReply) => {
  return reply.send({ wsConnection: true });
};

const wsHandler = async (
  connection: AssistantSocketStream,
  _req: FastifyRequest
) => {
  // Client error
  connection.socket.on("error", (error: Error) => {
    connection.socket.send(
      JSON.stringify({
        type: "error",
        payload: { message: error.message },
      } as WebsocketMessage<WSError>)
    );
  });

  // Client message
  connection.socket.on("message", async (message: string) => {
    const msg = JSON.parse(message) as {
      type: WebsocketMessageType;
      payload: WSInit | WSMessage | WSDisconnect | WSPing;
    };

    if (msg.type === "init") {
      await onInit(connection, ACTIVE_CLIENTS, msg as WebsocketMessage<WSInit>);
    }

    if (msg.type === "message") {
      onMessage(connection, ACTIVE_CLIENTS, msg as WebsocketMessage<WSMessage>);
    }

    if (msg.type === "disconnect") {
      onDisconnect(
        connection,
        ACTIVE_CLIENTS,
        msg as WebsocketMessage<WSDisconnect>
      );
    }

    if (msg.type === "ping") {
      onPing(connection);
    }
  });

  // Client disconnect -> remove it from the active list
  connection.socket.on("close", () => {
    if (connection.userId) {
      // first, delete openAI assistant on disconnect
      const client = ACTIVE_CLIENTS[connection.userId];
      const assistantId = client?.assistant?.id;
      if (assistantId) {
        deleteAssistant(assistantId);
      }

      // finally, delete from hash, always
      delete ACTIVE_CLIENTS[connection.userId];
    }

    connection.socket.close();
  });
};

export const askRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/ask",
  handler: handler,
  wsHandler: wsHandler,
  onRequest: validateJWT,
};

const websocketRoute = async (fastify: FastifyInstance) => {
  fastify.route(askRoute);
};

export { websocketRoute };
