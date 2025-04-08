import { SocketStream } from "@fastify/websocket";
import { Assistant } from "openai/resources/beta/assistants/assistants";
import { Thread } from "openai/resources/beta/threads/threads";

export type WebsocketMessageType =
  | "message"
  | "ping"
  | "pong"
  | "error"
  | "disconnect"
  | "init";

export type WebsocketMessage<T> = {
  type: WebsocketMessageType;
  payload: T;
};

export type WSError = { message: string };

export type WSInit = { userId: string; message: string };

export type WSDisconnect = { userId: string };

export type WSPing = object;

export type WSMessage = { userId: string; message: string };

export interface AssistantSocketStream extends SocketStream {
  userId?: string;
  assistant?: Assistant;
  thread?: Thread;
}

export type ActiveClients = Record<string, AssistantSocketStream>;
