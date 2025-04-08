import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { MedicationDb, db } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { Medication, SearchResponse } from "../types";

const filteredMedications = (
  searchQuery: string,
  pathizeMedications: MedicationDb[]
) => {
  if (searchQuery === "") return [];

  const filteredMeds = [];
  const searchMedications = pathizeMedications.map(
    (med) => med.medicationName?.toLowerCase() ?? ""
  );
  const searchField = searchQuery.toLowerCase();

  for (let i = 0; i < pathizeMedications.length; i++) {
    if (searchMedications[i].indexOf(searchField) !== -1) {
      filteredMeds.push(pathizeMedications[i]);
    }
  }

  // loop through all of the filtered meds and just return the id and name
  const filteredMedsWithIdAndName = filteredMeds.map((med) => {
    return {
      medicationId: med.id,
      medicationName: med.medicationName,
    };
  });

  return filteredMedsWithIdAndName;
};

type SearchMedicationsFromDbProps = {
  query: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: SearchMedicationsFromDbProps }>,
  reply: FastifyReply
) => {
  try {
    const { query } = request.query;
    const pathizeMedications: MedicationDb[] = await db.medicationDb.findMany(); // get all static medications we support out of our DB
    const medications = filteredMedications(query, pathizeMedications);

    return reply.status(200).send({
      status: 200,
      data: medications,
    } as SearchResponse<Medication>);
  } catch (err) {
    reply.status(500).send({
      status: 500,
      message: "Internal Server Error",
    } as SearchResponse<Medication>);
  }
};

const schema = {
  query: {
    type: "object",
    properties: {
      query: { type: "string" },
    },
    required: ["query"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "number" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              medicationId: { type: "string" },
              medicationName: { type: "string" },
            },
            required: ["medicationId", "medicationName"],
          },
        },
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
  },
};

export const searchMedicationsFromDbRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/searchMedicationsFromDb",
  onRequest: validateJWT,
  schema,
  handler,
};
