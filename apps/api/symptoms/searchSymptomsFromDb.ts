import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { SymptomDb, db } from "@pathize/db";
import { Symptom } from "../types";
import { validateJWT } from "../lib/validateJwt";
import { GetResponse } from "../types";

const filteredSymptoms = (
  searchQuery: string,
  pathizeSymptoms: SymptomDb[]
) => {
  // NOTE - this returns entire DB if search field is empty
  //if (searchQuery === "") return [];

  const searchField = searchQuery.toLowerCase();

  // every property in SymptomDb is defined
  return pathizeSymptoms
    .filter(
      (symptom) => symptom.symptomName?.toLowerCase().includes(searchField)
    )
    .map(
      (symptom) =>
        ({
          id: symptom.id,
          name: symptom.symptomName,
          category: symptom.symptomCategory,
          description: symptom.symptomDescription,
        }) as Symptom
    );
};

type Props = {
  searchQuery: string;
}

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  const { searchQuery } = request.query;

  try {
    const pathizeSymptoms: SymptomDb[] = await db.symptomDb.findMany();
    const allSymptoms: Symptom[] = filteredSymptoms(
      searchQuery,
      pathizeSymptoms
    );

    // if length is 0, return a 404
    if (allSymptoms.length === 0) {
      return reply.status(404).send({
        status: 404,
        message: "No symptoms found",
      } as GetResponse<null>);
    }

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: allSymptoms,
    } as GetResponse<Symptom>);
  } catch (err) {
    return reply.status(500).send({
      status: 500,
      message: "Internal Server Error",
    } as GetResponse<null>);
  }
};

const schema = {
  query: {
    type: "object",
    properties: {
      searchQuery: { type: "string" },
    },
    required: ["searchQuery"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              description: { type: "string" },
              category: { type: "string" },
            },
          },
          required: ["id", "name", "description", "category"],
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

export const getSymptomsFromDbRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/searchSymptomsFromDb",
  onRequest: validateJWT,
  schema,
  handler,
};
