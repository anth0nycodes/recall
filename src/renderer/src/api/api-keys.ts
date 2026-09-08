export const apiKeysApi = {
  saveOpenRouterApiKey: (apiKey: string) =>
    window.api.saveOpenRouterApiKey(apiKey),
  hasOpenRouterApiKey: () => window.api.hasOpenRouterApiKey(),
  clearOpenRouterApiKey: () => window.api.clearOpenRouterApiKey(),
};
