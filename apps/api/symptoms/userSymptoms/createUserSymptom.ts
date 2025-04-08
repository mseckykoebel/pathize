import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db, UserSymptom } from "@pathize/db";
import { PostResponse } from "../../types";
import { validateJWT } from "../../lib";

type Props = {
  userId: string;
  category: string;
  description?: string;
  name: string;
  symptomId?: string;
  notes?: string;
};

const handler = async (
  request: FastifyRequest<{
    Body: Props;
  }>,
  reply: FastifyReply
) => {
  const { userId, category, name, description, symptomId, notes } =
    request.body;

  try {
    // check to see if there is a userMedication in the DB that has this medicationName
    const userSymptomWithSameName = await db.userSymptom.findFirst({
      where: {
        userId: userId,
        name: name,
      },
    });

    if (userSymptomWithSameName) {
      return reply.status(400).send({
        status: 400,
        message: "Symptom with this name exists already.",
      } as PostResponse<null>);
    }

    const createdUserSymptom = await db.userSymptom.create({
      data: {
        userId: userId,
        symptomId: symptomId,
        category: category,
        name: name,
        description: description,
        notes: notes,
      },
    });

    return reply.status(200).send({
      status: 200,
      data: createdUserSymptom,
    } as PostResponse<UserSymptom>);
  } catch (err) {
    console.log(err);
    reply.status(500).send({
      status: 500,
      message: "Internal Server Error",
    } as PostResponse<null>);
  }
};

const schema = {
  body: {
    type: "object",
    properties: {
      userId: { type: "string" },
      category: { type: "string" },
      name: { type: "string" },
      description: { type: "string" },
      symptomId: { type: "string" },
      notes: { type: "string" },
    },
    required: ["userId", "category", "name"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
        data: {
          type: "object",
          properties: {
            id: { type: "string" },
            userId: { type: "string" },
            symptomId: { type: "string" },
            category: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            notes: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: ["id", "userId", "category", "name", "createdAt"],
        },
      },
      required: ["status", "data"],
    },
    404: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },
      required: ["status", "message"],
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
};

export const createUserSymptomRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/createUserSymptom",
  onRequest: validateJWT,
  handler,
  schema,
};
