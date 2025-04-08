export type AuthResponse<T> = {
  status: number;
  message?: string;
  data?: T;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export type RegisterResponse = {
  accessToken: string;
  refreshToken: string;
};
