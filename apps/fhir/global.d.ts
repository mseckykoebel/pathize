declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly PORT?: number;
    }
  }
}

export {};
