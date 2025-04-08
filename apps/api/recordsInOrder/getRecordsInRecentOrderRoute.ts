import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { validateJWT } from "../lib";
import { GetResponse } from "../types";
import {
  RecordType,
  TypeOfRecord,
  TypeOfUserRecord,
  findRecords,
  findUserRecords,
  getUniqueRecordId,
} from "./utils";

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
    // get all of the user records matching recordType
    const records = await findRecords(recordType, {
      where: { userId: userId },
    });

    if (records.length === 0) {
      return reply.status(404).send({
        status: 404,
        message: "No records found",
      } as GetResponse<null>);
    }

    // filter out duplicate records
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

    // sort records
    const sortedRecords = uniqueRecords.sort((a, b) => {
      return (
        new Date(b.createdDay).getTime() - new Date(a.createdDay).getTime()
      );
    });

    console.log("sortedRecords: ", sortedRecords);

    // now, we need to get all of the UserRecords where uniqueIds are present
    const userRecords = await findUserRecords(recordType, {
      where: { id: { in: Array.from(uniqueIds) } },
    });

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: userRecords,
    } as GetResponse<TypeOfUserRecord<typeof recordType>>);
  } catch (err) {
    return reply.status(500).send({
      status: 500,
      message: "Internal Server Error",
    } as GetResponse<null>);
  }
};

export const getRecordsInRecentOrderRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getRecordsInRecentOrder",
  onRequest: validateJWT,
  handler,
};
