export type PostResponse<T> = {
  status: number;
  message?: string;
  data?: T[] | T;
};
