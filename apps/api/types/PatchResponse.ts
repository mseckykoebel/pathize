export type PatchResponse<T> = {
  status: number;
  message?: string;
  data?: T;
};
