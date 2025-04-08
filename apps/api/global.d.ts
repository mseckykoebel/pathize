declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly PORT?: number;
      readonly TERRA_API_KEY: string;
      readonly TERRA_DEV_ID: string;
      readonly TERRA_SIGNING_SECRET: string;
      readonly PUBLIC_ACCESS_TOKEN_KEY: string;
      readonly PRIVATE_ACCESS_TOKEN_KEY: string;
      readonly PUBLIC_REFRESH_TOKEN_KEY: string;
      readonly PRIVATE_REFRESH_TOKEN_KEY: string;
      readonly PUBLIC_PASSWORD_RESET_TOKEN_KEY: string;
      readonly PRIVATE_PASSWORD_RESET_TOKEN_KEY: string;
      readonly FIREBASE_PRIVATE_KEY: string;
      readonly NOTION_API_KEY: string;
      readonly NOTION_DATABASE_ID: string;
      readonly CIO_API_KEY_1: string;
    }
  }
}

export {}; // makes it a module, which is required in es6 (if there are no imports or exports)
