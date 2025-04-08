/* eslint-disable indent */
import { FunctionDefinition } from "openai/resources";
import { QueryFunction, QueryFunctionResponse, QueryParams } from "../../types";

/**
 * @description a record function is any function that interacts with database records
 */
export async function createRecordQueryFunction(
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

  return { queryFunction, definition };
}
