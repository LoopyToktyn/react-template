// src/global.d.ts
export {};

declare global {
  interface Window {
    _env_: {
      BASE_URL?: string;
      ENABLE_AUTH?: string;
      [key: string]: string | undefined;
    };
  }
}
