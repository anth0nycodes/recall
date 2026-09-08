import { User } from "../types";

interface RecallAPI {
  getUser: () => Promise<User>;
}

declare global {
  interface Window {
    api: RecallAPI;
  }
}

export {};
