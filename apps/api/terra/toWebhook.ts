/* eslint-disable indent */
import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { Daily, Sleep, TerraUser } from "terra-api";
import dayjs from "dayjs";

import { DeviceResource } from "@pathize/db";
import { updateOrCreateDailyRecord, updateOrCreateSleepRecord } from "./utils";

type ExtendedTerraUser = TerraUser & {
  reference_id: string;
  resource: DeviceResource;
};

type TerraWebhookResponse<T> = {
  status: string;
  type: string;
  user: ExtendedTerraUser;
  message?: string;
  data?: T[];
  retry_after_seconds?: number;
  widget_session_id?: string; // uuid
  reference_id?: string; // uuid
  reason?: string;
};

const handler = async (request: FastifyRequest, reply: FastifyReply) => {
  const headers = request.headers;
  const body = request.body as TerraWebhookResponse<never>;

  if (headers["terra-retry-count"] || !headers["terra-signature"])
    return reply.status(200).send();

  switch (body.type) {
    case "daily": {
      console.log("Daily webhook received!");
      const responseBody: TerraWebhookResponse<Daily> = body;
      const dailyData = responseBody.data as Daily[];
      if (
        dailyData.length === 0 ||
        !responseBody.user.reference_id ||
        !responseBody.user.user_id
      ) {
        break;
      }

      // HANDLE UPDATING AND/OR CREATING RECORDS
      await Promise.allSettled(
        dailyData.map((data) =>
          updateOrCreateDailyRecord(
            data,
            responseBody.user.reference_id,
            responseBody.user.user_id,
            responseBody.user.provider as DeviceResource,
            responseBody.user.last_webhook_update
              ? dayjs(responseBody.user.last_webhook_update).toDate()
              : null,
            dayjs(data.metadata.start_time).format("YYYY-MM-DD")
          )
        )
      );

      reply.status(200).send({ status: 200, message: "ok" });
      break;
    }
    case "sleep": {
      console.log("Sleep webhook received!");
      const responseBody: TerraWebhookResponse<Sleep> = body;
      const sleepData = responseBody.data as Sleep[];
      if (
        sleepData.length === 0 ||
        !responseBody.user.reference_id ||
        !responseBody.user.user_id
      ) {
        break;
      }

      // HANDLE UPDATING AND/OR CREATING RECORDS
      await Promise.allSettled(
        sleepData.map((data) =>
          updateOrCreateSleepRecord(
            data,
            responseBody.user.reference_id,
            responseBody.user.user_id,
            responseBody.user.provider as DeviceResource,
            responseBody.user.last_webhook_update
              ? dayjs(responseBody.user.last_webhook_update).toDate()
              : null,
            dayjs(data.metadata.start_time).format("YYYY-MM-DD")
          )
        )
      );

      reply.status(200).send({ status: 200, message: "ok" });
      break;
    }
    case "error": {
      console.log("Error with the webhook: ", body);
      break;
    }
    case "auth": {
      console.log("Auth webhook received");
      reply.status(200).send({ status: 200, message: "ok" });
      break;
    }
    case "healthcheck": {
      console.log("Healthcheck webhook received");
      console.log(body);
      break;
    }
    default: {
      console.log("Unhandled webhook type", body.type);
    }
  }
};

export const toWebhookRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/toWebhook",
  handler,
};
