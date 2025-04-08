import {
  Thread,
  ThreadCreateParams,
} from "openai/resources/beta/threads/threads";
import { RunSubmitToolOutputsParams } from "openai/resources/beta/threads/runs/runs";
import { Assistant } from "openai/resources/beta/assistants/assistants";
import path from "node:path";
import fs from "node:fs";

import { openai } from "./getOpenAiEnv";
import { getDefinitions, getFunctions } from "./functions";
import { getCurrentDateInTimezone, getUserTimezoneString } from "./utils";
import { WebSocket } from "ws";
import { QueryFunction } from "./types";

if (!openai) {
  throw new Error(
    "OpenAI object not found. Maybe you forgot to configure your OpenAI setup options inside ./openai, or do not have an env file?"
  );
}

/**
 * @description get the prompt
 */
function getInstructions() {
  const dirPath = path.join(__dirname, "./prompts");
  const files = fs.readdirSync(dirPath);
  const markdownFiles = files.filter((file) => path.extname(file) === ".md");
  const markdownFileContent = fs.readFileSync(
    path.join(dirPath, markdownFiles[0]),
    "utf8"
  );

  return markdownFileContent;
}

/**
 * @description get the resources for the model (not used currently)
 */
export async function getResources() {
  const dirPath = path.join(__dirname, "./resources");
  const files = fs.readdirSync(dirPath);
  const pdfFiles = files.filter((file) => path.extname(file) === ".pdf");

  try {
    const openAiFiles = await Promise.all(
      pdfFiles.map(async (pdfFile) => {
        const filePath = path.join(dirPath, pdfFile);
        const file = await openai.files.create({
          file: fs.createReadStream(filePath),
          purpose: "assistants",
        });
        return file;
      })
    );

    return openAiFiles;
  } catch (err) {
    console.log("ERROR GETTING FILES: ", err);
    return [];
  }
}

/**
 * @description create the assistant
 */
export async function createAssistant() {
  try {
    const { definitions } = await getDefinitions();
    const assistant = await openai.beta.assistants.create({
      name: "Health Assistant",
      instructions: getInstructions(),
      model: "gpt-4-1106-preview",
      tools: [
        ...Object.entries(definitions).map(([, func]) => ({
          type: "function" as const,
          function: func,
        })),
      ],
      file_ids: [],
    });

    return assistant;
  } catch (err) {
    console.log("ERROR CREATING ASSISTANT: ", err);
    return undefined;
  }
}

/**
 * @description create the assistant thread
 */
export async function createNewAssistantThread() {
  // get the messages from the DB and initialize the new thread with them
  const messages: ThreadCreateParams.Message[] = [];

  try {
    const thread = await openai.beta.threads.create({ messages: messages });
    return thread;
  } catch (err) {
    console.log("ERROR CREATING NEW ASSISTANT THREAD: ", err);
    return undefined;
  }
}

/**
 * @description get the assistant's response to the message (where most of the magic happens)
 */
export async function getResultFromUserMessage(
  userMessage: string,
  ws: WebSocket,
  thread: Thread,
  assistant: Assistant,
  userId: string
) {
  try {
    const { functions: FUNCTIONS } = await getFunctions();
    const userTimezoneString = await getUserTimezoneString(userId);
    const currentDay = getCurrentDateInTimezone(userTimezoneString);

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content:
        userMessage + " - the current day where I am located is " + currentDay,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });

    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    while (runStatus.status !== "completed") {
      // wait one second and get the status again
      await new Promise((resolve) => setTimeout(resolve, 100));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      if (
        runStatus.status === "failed" ||
        runStatus.status === "expired" ||
        runStatus.status === "cancelled"
      ) {
        if (runStatus.status !== "cancelled") {
          ws.send(
            JSON.stringify({
              type: "error",
              payload: {
                message: `Assistant message ${runStatus.status} - please try again shortly`,
              },
            })
          );
        }

        return `Response ${runStatus.status} - please try again shortly`;
      }

      // tooling if needed before re-requesting a new message
      if (runStatus.status === "requires_action") {
        // first, send a message through ws that there are files
        ws.send(
          JSON.stringify({
            type: "message",
            payload: {
              message: "Message pending using function calls",
            },
          })
        );

        const functionOutputs: RunSubmitToolOutputsParams.ToolOutput[] = [];
        const toolCalls =
          runStatus.required_action?.submit_tool_outputs.tool_calls;
        if (toolCalls) {
          for (const tool of toolCalls) {
            const functionName = tool.function.name;
            console.log("FUNCTION NAME: ", functionName);
            const functionArgs = JSON.parse(tool.function.arguments);
            // TODO: more validation here?
            functionArgs.userId = userId;
            const functionArgsArray = Object.values(functionArgs);
            console.log("FUNCTION ARGS: ", functionArgsArray);
            const functionToCall = FUNCTIONS[functionName] as QueryFunction;
            const functionResponse = await functionToCall(functionArgs);
            console.log("FUNCTION RESPONSE: ", functionResponse);
            functionOutputs.push({
              tool_call_id: tool.id,
              output: JSON.stringify(functionResponse),
            });
          }
        }

        // when done, submit the tool outputs
        await openai.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
          tool_outputs: functionOutputs,
        });
      }
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessageForRun = messages.data
      .filter(
        (message) => message.run_id === run.id && message.role === "assistant"
      )
      .pop();

    // TODO: save this message to the backend as a consistent message stream
    // return the message
    if (lastMessageForRun) {
      return lastMessageForRun.content[0];
    } else {
      return "There was an error getting the message from the assistant. Please ask a question to try again.";
    }
  } catch (err) {
    console.log("ERROR IN GET RESULT FROM USER MESSAGE: ", err);
    ws.send(
      JSON.stringify({
        type: "error",
        payload: {
          message: "There was an error getting a response from the assistant.",
        },
      })
    );
    return "There was an error getting the message from the assistant. Please ask a question to try again.";
  }
}

export async function deleteAssistant(assistantId: string) {
  try {
    const { deleted } = await openai.beta.assistants.del(assistantId);
    if (deleted) {
      console.log("DELETED ASSISTANT: ", assistantId);
    } else {
      console.log("FAILED TO DELETE ASSISTANT: ", assistantId);
    }
  } catch (err) {
    console.log("ERROR DELETING ASSISTANT: ", err);
    return undefined;
  }
}
