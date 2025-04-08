import { JsonValue } from "type-fest";

export type QueryParams = {
  userId: string;
  endDate: string;
  startDate?: string;
};

export type QueryFunctionResponse =
  | Record<
      string,
      string | number | boolean | JsonValue | undefined | null | Date
    >[]
  | string
  | number
  | JsonValue
  | boolean
  | undefined
  | null;

export type QueryFunction = (
  params: QueryParams
) => Promise<QueryFunctionResponse>;
