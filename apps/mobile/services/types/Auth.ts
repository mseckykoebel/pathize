export type DispatchPayload = {
  type:
    | 'REFRESH_ACCESS_TOKEN'
    | 'SIGNED_OUT'
    | 'REGISTERED_NO_SUBSCRIPTION'
    | 'REGISTERED_RENEWING_SUBSCRIPTION'
    | 'REGISTERED_WITH_SUBSCRIPTION';
  accessToken?: string | undefined;
  userId?: string | undefined;
  refreshToken?: string | undefined;
};
