import { format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

import { db } from "@pathize/db";
import {
  createAssistant,
  createNewAssistantThread,
  deleteAssistant,
  getResultFromUserMessage,
} from "../assistant";
import type {
  WebsocketMessage,
  AssistantSocketStream,
  ActiveClients,
  WSInit,
  WSMessage,
  WSDisconnect,
} from "../../types";

/**
 * @description handles the initial incoming websocket connection
 */
export async function onInit(
  connection: AssistantSocketStream,
  activeClients: ActiveClients,
  message: WebsocketMessage<WSInit>
) {
  const userId = message.payload.userId;

  // first, check to see if the user is already connected
  if (activeClients[userId]) {
    // delete the user from active clients
    delete activeClients[userId];
  }

  // get the assistant and the thread
  const assistant = await createAssistant();
  const thread = await createNewAssistantThread();

  // assign to current connection and then assign to map
  connection.userId = userId;
  connection.assistant = assistant;
  connection.thread = thread;
  activeClients[userId] = connection;

  connection.socket.send(
    JSON.stringify({
      type: "init",
      payload: {
        message: `Initialization complete\n
              User ID: ${userId}\n
              Assistant ID: ${assistant?.id}\n
              Thread ID: ${thread?.id}`,
      },
    })
  );
}

/**
 * @description handles incoming messages from the client
 */
export async function onMessage(
  connection: AssistantSocketStream,
  activeClients: ActiveClients,
  message: WebsocketMessage<WSMessage>
) {
  const userId = message.payload.userId;
  const messageContent = message.payload.message;

  // check to see if activeClients.userId is inside of the hash
  // TODO: also make sure that onInit set up a new assistant and a new thread
  if (!activeClients[userId]) {
    return connection.socket.send(
      JSON.stringify({
        type: "error",
        payload: { message: "User was not initialized first" },
      })
    );
  }

  // thread and assistant defined if in activeClients
  const messageResult = await getResultFromUserMessage(
    messageContent,
    connection.socket,
    connection.thread!,
    connection.assistant!,
    userId
  );

  let extractedMessage: string;

  if (typeof messageResult === "string") {
    extractedMessage = messageResult;
  } else if ("imageFile" in messageResult) {
    extractedMessage = `Image file received with name: ${messageResult.imageFile}`;
  } else if ("text" in messageResult) {
    extractedMessage = messageResult.text.value;
  } else {
    extractedMessage = "Unknown message format";
  }

  connection.socket.send(
    JSON.stringify({
      type: "message",
      payload: { message: extractedMessage },
    })
  );
}

/**
 * @description handles disconnect request from the client, cleaning up the active clients hash
 */
export async function onDisconnect(
  connection: AssistantSocketStream,
  activeClients: ActiveClients,
  message: WebsocketMessage<WSDisconnect>
) {
  if ("userId" in message.payload) {
    const client = activeClients[message.payload.userId];
    if (client && client.assistant) {
      await deleteAssistant(client.assistant.id);
      delete activeClients[message.payload.userId];
    } else {
      delete activeClients[message.payload.userId];
    }
  }

  connection.socket.send(
    JSON.stringify({
      type: "disconnect",
      payload: { message: "Disconnection complete" },
    })
  );
}

/**
 * @description handles ping request from the client
 */
export function onPing(connection: AssistantSocketStream) {
  connection.socket.send(
    JSON.stringify({
      type: "pong",
      payload: { message: "pong" },
    })
  );
}

/**
 * @description returns the current day as YYYY-MM-DD
 */
export function getCurrentDateInTimezone(timezone: string) {
  const date = new Date();
  const zonedDate = utcToZonedTime(date, timezone);
  return format(zonedDate, "yyyy-MM-dd");
}

export async function getUserTimezoneString(userId: string) {
  try {
    const response = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        timezone: true,
      },
    });

    if (!response || !response.timezone) {
      return "America/New_York";
    } else {
      return response.timezone;
    }
  } catch (err) {
    return "America/New_York";
  }
}
