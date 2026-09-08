import { z } from "zod";

export const ApiKeySchema = z.object({
  apiKey: z.string().min(1, { message: "API key is required" }),
});
