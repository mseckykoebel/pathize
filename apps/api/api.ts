import Fastify, { FastifyBaseLogger, FastifyRequest } from "fastify";
import fastifyCors from "@fastify/cors";
import FastifyWebsocket from "@fastify/websocket";
import fastifyCron from "fastify-cron";
import pino from "pino";
import pinoPretty from "pino-pretty";
import dotenv from "dotenv";

import { firebaseAdmin } from "./firebase";

import {
  deleteOldSamplesJob,
  energyNotificationsJob,
  checkInNotificationsJob,
} from "./cron";
import { websocketRoute } from "./ask";
import { registerRoutes } from "./routes";

dotenv.config({ path: ".env.local" });

const fastify = Fastify({
  logger: pino(
    {
      level: "info",
      serializers: {
        req: (req: FastifyRequest) =>
          `Request: method=${req.method}, url=${req.url}`,
      },
    },
    pinoPretty({ colorize: true, colorizeObjects: true })
  ) as FastifyBaseLogger,
  bodyLimit: 31457280 * 2,
});

// register cors
fastify.register(fastifyCors, {
  origin: (
    origin: string | undefined,
    cb: (err: Error | null, origin: boolean) => void
  ) => {
    // During automated testing, no origin is provided
    if (origin === undefined) {
      cb(null, true);
      return;
    }

    const hostname = new URL(origin).hostname;
    // local development
    if (hostname === "localhost" || hostname === "10.0.2.2") {
      cb(null, true);
      return;
    }
    // our API
    if (
      hostname === "jupiter-api.fly.dev" ||
      hostname === "jupiter-api-staging.fly.dev"
    ) {
      cb(null, true);
      return;
    }
    cb(new Error("Not allowed"), false);
  },
});

// register websockets
fastify.register(FastifyWebsocket, {
  options: {
    maxPayload: 1048576,
  },
});

// register cron
fastify.register(fastifyCron, {
  jobs: [
    // TODO: deprecated in favor of check-ins. clean up reminders backend inside of app
    // reminderNotificationsJob,
    energyNotificationsJob,
    checkInNotificationsJob,
    deleteOldSamplesJob,
  ],
});

// routes
fastify.register(websocketRoute);
registerRoutes(fastify);

// start 🚗
const start = async () => {
  const port = Number(process.env.PORT || 3000);
  try {
    fastify.listen(
      {
        port: port,
        host: "0.0.0.0",
      },
      () => {
        fastify.cron.startAllJobs();
      }
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

export { start, firebaseAdmin };
