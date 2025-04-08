import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { db, UserSymptom } from "@pathize/db";
import { validateJWT } from "../../lib/validateJwt";
import { PatchResponse, SymptomCategory } from "../../types";

type Props = {
  id: string;
  category?: SymptomCategory;
  name?: string;
  notes?: string;
};

const handler = async (
  request: FastifyRequest<{ Body: Props }>,
  reply: FastifyReply
) => {
  const { id, name, notes, category } = request.body;

  try {
    const updateUserSymptom = await db.userSymptom.update({
      where: {
        id: id, // the ID for the user symptom
      },
      data: {
        ...(name ? { name: name } : {}),
        ...(category ? { category: category } : {}),
        notes: notes,
        updatedAt: new Date(),
      },
    });

    if (!updateUserSymptom) {
      return reply.code(404).send({
        status: 404,
        message: "No user symptom found",
      } as PatchResponse<null>);
    }

    // NOW WE NEED TO UPDATE ALL THE SYMPTOM RECORDS THAT HAVE THIS USER SYMPTOM ID
    // GET ALL THE RECORDS AND UPDATE THEM
    // ONLY APPLIES IF NAME EXISTS (signaling this is a custom symptom)
    if (name) {
      const symptomRecords = await db.symptomRecord.findMany({
        where: {
          userSymptomId: id,
        },
      });

      // UPDATE ALL OF THEM IN PARALLEL
      symptomRecords.forEach(async (record) => {
        await db.symptomRecord.update({
          where: { id: record.id },
          data: {
            ...record,
            name: name,
            updatedAt: new Date(),
          },
        });
      });
    }

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: updateUserSymptom,
    } as PatchResponse<UserSymptom>);
  } catch (err) {
    console.log(err);
    reply.code(500).send({
      status: 500,
      message: "Internal Server Error",
    } as PatchResponse<null>);
  }
};

const schema = {
  body: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      notes: { type: "string" },
      category: { type: "string" },
    },
    required: ["id"],
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
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            name: { type: "string" },
            category: { type: "string" },
            description: { type: "string" },
            notes: { type: "string" },
          },
          required: ["id", "userId", "name", "category", "createdAt"],
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

export const updateUserSymptomRoute = {
  method: "PATCH" as HTTPMethods,
  url: "/api/v1/updateUserSymptom",
  onRequest: validateJWT,
  handler,
  schema,
};
