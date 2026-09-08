import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiKeysApi } from "@renderer/api/api-keys";
import { Button } from "@renderer/components/ui/button";
import { Field, FieldError, FieldLabel } from "@renderer/components/ui/field";
import { Input } from "@renderer/components/ui/input";
import { getErrorMessage } from "@renderer/utils/helpers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { ApiKeySchema } from "../../../../../schemas/ApiKeySchema";
import { OnboardingStepProps } from "./types";

export function OpenrouterApiKey({ onNext }: OnboardingStepProps) {
  const inputClasses =
    "text-lg w-52 placeholder:text-lg border-none h-11 placeholder:text-muted-foreground bg-accent";

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof ApiKeySchema>) =>
      apiKeysApi.saveOpenRouterApiKey(data.apiKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["has-openrouter-api-key"] });
      onNext();
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      throw new Error(`Failed to save API key: ${errorMessage}`);
    },
  });

  const form = useForm<z.infer<typeof ApiKeySchema>>({
    resolver: zodResolver(ApiKeySchema),
    defaultValues: {
      apiKey: "",
    },
  });

  function onSubmit(data: z.infer<typeof ApiKeySchema>) {
    mutate(data);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-4">
          <span className="text-center text-4xl font-medium">
            Do you have an OpenRouter API key?
          </span>
          <p className="font-geist text-muted-foreground text-center text-[20px]">
            Connect your key to power Recall’s AI agent.
          </p>
        </div>
        <form
          className="font-geist w-full"
          id="api-key"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <Controller
            name="apiKey"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-base" htmlFor="api-key">
                  Your API Key
                </FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  className={inputClasses}
                  required
                  id="api-key"
                  type="password"
                  placeholder="Paste your API key here"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </form>
      </div>
      <div className="flex w-full justify-between gap-4">
        <Button
          form="api-key"
          type="submit"
          disabled={isPending}
          className="font-geist px-5 py-2 text-lg"
        >
          Continue
        </Button>
        <Button
          onClick={onNext}
          variant="ghost"
          className="font-geist text-muted-foreground flex items-center gap-2 px-5 py-2 text-lg"
        >
          <span>Skip for now</span>
        </Button>
      </div>
    </div>
  );
}
