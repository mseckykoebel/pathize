import env from 'react-native-config';

export const config = {
  api: {
    host: env.API_HOST,
    environment: env.ENVIRONMENT,
    timeout: 20000,
  },
};

export const API_HOST = config.api.host;

export const CUSTOMER_IO_CONFIG = {
  siteId: '886aab83ed4eae741730',
  apiKey: 'b5098ef21735581514d5',
};

// PATHIZE ENTITLEMENTS
export const MONTHLY_SUBSCRIPTION_IDENTIFIER = 'p_1499_1m_v1';

// REVENUECAT PROMOTIONAL ENTITLEMENTS
export const YEARLY_PROMOTION_IDENTIFIER = 'rc_promo_Subscriber_yearly';

// //
// USERS WITH LIFETIME SUBSCRIPTIONS AND NON-APPLE WEARABLE AUTHORIZATION
////

export const LIFETIME_KEYS = [
  'msk@msk.com', // for testing
  'mseckykoebel@gmail.com',
  'mason@pathizehealth.com',
  'alexbahram@gmail.com',
  'jkoebelsecky@gmail.com',
  'easavin3@gmail.com',
];

export const NON_APPLE_WEARABLES = [
  'msk@msk.com', // for testing
  'easavin3@gmail.com',
  'mseckykoebel@gmail.com',
  'mason@pathizehealth.com',
];
