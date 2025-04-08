/* eslint-disable indent */
import { FunctionDefinition } from "openai/resources";
import { QueryFunction, QueryFunctionResponse, QueryParams } from "../../types";

/**
 *
 * @param functionName camelCase name of the function
 * @param functionDescription description of what the function does and what it returns
 * @param whatFunctionReturns a few words describing what the function returns, used for error return message(s)
 * @param query the prisma query function that will be called
 * @param includeStartDate whether or not the function should include a startDate parameter
 * @returns the query function and the openAI function definition
 */
export async function createDailySleepQueryFunction(
  functionName: string,
  functionDescription: string,
  whatFunctionReturns: string,
  query: (params: QueryParams) => Promise<QueryFunctionResponse>
): Promise<{
  queryFunction: QueryFunction;
  definition: FunctionDefinition;
}> {
  // 1) Build query function
  const queryFunction: QueryFunction = async (params: QueryParams) => {
    try {
      const response = await query(params);
      return response;
    } catch (err) {
      return `Unable to get the patients' ${whatFunctionReturns}, please call with different parameters.`;
    }
  };

  // 2) Build function definition
  const definition: FunctionDefinition = {
    name: functionName,
    description: functionDescription,
    parameters: {
      type: "object",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      properties: {
        userId: {
          type: "string",
          description:
            "The user id for the user, which is used to identify the patient that the data is for.",
        },
        endDate: {
          type: "string",
          description:
            "The ending date to get the data for. Dates are formatted as YYYY-MM-DD.",
        },
      },
      required: ["userId", "endDate"],
    },
  };

  // 3) return both
  return { queryFunction, definition };
}
