import { db } from "@pathize/db";
import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

const handler = async (_request: FastifyRequest, reply: FastifyReply) => {
  try {
    const users = await db.user.findMany();
    // filter out everything but email address
    const filteredUsers = users.map((user) => {
      return {
        email: user.email,
      };
    });
    return reply.status(200).send(filteredUsers);
  } catch (err) {
    console.error(err);
    return reply.status(500).send({
      status: 500,
      message: "Internal Server Error",
    });
  }
};

export const getAllUsersRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/getAllUsers",
  handler,
};
