import { HTTPMethods } from "fastify";

const method: HTTPMethods = "GET";

export const healthCheckRoute = {
  method,
  url: "/",
  handler: async () => {
    return { ok: true };
  },
};
