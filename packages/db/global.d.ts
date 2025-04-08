declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly PUBLIC_ENCRYPTION_KEY: string;
      readonly PRIVATE_ENCRYPTION_KEY: string;
    }
  }
}

export {}; // makes it a module, which is required in es6 (if there are no imports or exports)
