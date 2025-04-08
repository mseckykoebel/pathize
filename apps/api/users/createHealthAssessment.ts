import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

import { ClinicalSurvey, db } from "@pathize/db";
import { validateJWT } from "../lib/validateJwt";
import { PostResponse } from "../types";

type Props = {
  userId: string;
  healthAssessment: ClinicalSurvey;
};

const handler = async (
  request: FastifyRequest<{ Body: Props }>,
  reply: FastifyReply
) => {
  const { userId, healthAssessment } = request.body;

  try {
    const createSurvey = await db.clinicalSurvey.create({
      data: {
        medicalProblemsHavePreventedMeFromAccomplishingGoals:
          healthAssessment.medicalProblemsHavePreventedMeFromAccomplishingGoals,
        completelyOverwhelmedByMedicalProblems:
          healthAssessment.completelyOverwhelmedByMedicalProblems,
        levelOfPain: healthAssessment.levelOfPain,
        levelOfEnergy: healthAssessment.levelOfEnergy,
        qualityOfSleep: healthAssessment.qualityOfSleep,
        levelOfMemoryProblems: healthAssessment.levelOfMemoryProblems,
        userId: userId,
      },
    });

    return reply.status(200).send({
      status: 200,
      message: "OK",
      data: createSurvey,
    } as PostResponse<ClinicalSurvey>);
  } catch (err) {
    reply.code(500).send({
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
      healthAssessment: {
        type: "object",
        properties: {
          medicalProblemsHavePreventedMeFromAccomplishingGoals: {
            type: "number",
          },
          completelyOverwhelmedByMedicalProblems: { type: "number" },
          levelOfPain: { type: "number" },
          levelOfEnergy: { type: "number" },
          qualityOfSleep: { type: "number" },
          levelOfMemoryProblems: { type: "number" },
        },
        required: [
          "medicalProblemsHavePreventedMeFromAccomplishingGoals",
          "completelyOverwhelmedByMedicalProblems",
          "levelOfPain",
          "levelOfEnergy",
          "qualityOfSleep",
          "levelOfMemoryProblems",
        ],
      },
    },
    required: ["userId", "healthAssessment"],
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
            medicalProblemsHavePreventedMeFromAccomplishingGoals: {
              type: "number",
            },
            completelyOverwhelmedByMedicalProblems: { type: "number" },
            levelOfPain: { type: "number" },
            levelOfEnergy: { type: "number" },
            qualityOfSleep: { type: "number" },
            levelOfMemoryProblems: { type: "number" },
            userId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          required: [
            "medicalProblemsHavePreventedMeFromAccomplishingGoals",
            "completelyOverwhelmedByMedicalProblems",
            "levelOfPain",
            "levelOfEnergy",
            "qualityOfSleep",
            "levelOfMemoryProblems",
            "userId",
            "createdAt",
          ],
        },
      },
      required: ["status", "data"],
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

export const createHealthAssessmentRoute = {
  method: "POST" as HTTPMethods,
  url: "/api/v1/createHealthAssessment",
  schema,
  handler,
  onRequest: validateJWT,
};
