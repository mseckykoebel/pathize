export type GetResponse<T> = {
  status: number;
  message?: string;
  data?: T | T[];
};
