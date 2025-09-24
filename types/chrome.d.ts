declare global {
  interface Window {
    chrome?: {
      storage: {
        sync: {
          set: (items: { [key: string]: unknown }) => Promise<void>;
          get: (keys?: string | string[] | { [key: string]: unknown }) => Promise<{ [key: string]: unknown }>;
        };
      };
      runtime: {
        sendMessage: (message: unknown, callback?: (response: unknown) => void) => void;
        getURL: (path: string) => string;
      };
    };
  }
}

export interface ChromeStorage {
  sync: {
    set: (items: { [key: string]: any }) => Promise<void>;
    get: (keys?: string | string[] | { [key: string]: any }) => Promise<{ [key: string]: any }>;
  };
}

export interface ChromeRuntime {
  sendMessage: (message: any, callback?: (response: any) => void) => void;
}