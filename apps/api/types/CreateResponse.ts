export type CreateResponse<T> = {
  status: number;
  message?: string;
  data?: T;
};
