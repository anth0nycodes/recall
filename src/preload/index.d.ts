interface RecallAPI {
  ping: () => void;
}

declare global {
  interface Window {
    api: RecallAPI;
  }
}

export {};
