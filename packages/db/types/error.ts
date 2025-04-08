export type JWTExpiredError = {
  status: 403;
  message: "JWT expired";
};

export type JWTError = {
  claim: string;
  code: string;
  name: string;
  reason: string;
};
