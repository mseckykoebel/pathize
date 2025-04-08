export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return String(error);
};

export const throwNeverError = (): never => {
  throw new Error("Error: unable to fetch correct code for this vital sign");
};
