/* eslint-disable indent */
import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import {
  RecordType,
  TypeOfRecord,
  TypeOfUserRecord,
  findRecords,
  getUniqueRecordId,
} from "./utils";
import { validateJWT } from "../lib";
import { GetResponse } from "../types";

type Props = {
  userId: string;
  recordType: RecordType;
};

const handler = async (
  request: FastifyRequest<{ Querystring: Props }>,
  reply: FastifyReply
) => {
  const { userId, recordType } = request.query;

  try {
    const records = await findRecords(recordType, {
      where: { userId: userId },
    });

    if (records.length === 0) {
      return reply.status(404).send({
        status: 404,
        message: "No records found",
      } as GetResponse<null>);
    }

    // Count the occurrences of each ID.
    const idCounts: Record<string, number> = {};
    records.forEach((record) => {
      const id = getUniqueRecordId(record, recordType);
      if (id) {
        idCounts[id] = (idCounts[id] || 0) + 1;
      }
    });

    // Filter unique records based on the IDs.
    const uniqueIds = new Set<string>();
    const uniqueRecords = (
      records as Array<TypeOfRecord<typeof recordType>>
    ).filter((record) => {
      const id = getUniqueRecordId(record, recordType);
      if (id && !uniqueIds.has(id)) {
        uniqueIds.add(id);
        return true;
      }
      return false;
    });

    // Sort records based on ID occurrences and then by createdAt.
    const sortedRecords = uniqueRecords.sort((a, b) => {
      const idA = getUniqueRecordId(a, recordType);
      const idB = getUniqueRecordId(b, recordType);

      const countDifference = (idCounts[idB] || 0) - (idCounts[idA] || 0);
      if (countDifference !== 0) {
        return countDifference;
      }

      return (
        new Date(b.createdDay).getTime() - new Date(a.createdDay).getTime()
      );
    });

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: sortedRecords,
    } as GetResponse<TypeOfUserRecord<typeof recordType>>);
  } catch (err) {
    return reply.status(500).send({
      status: 500,
      message: "Internal Server Error",
    } as GetResponse<null>);
  }
};

export const getRecordsByMostRecordedRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getRecordsByMostRecorded",
  onRequest: validateJWT,
  handler,
};
