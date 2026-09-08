import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiKeysApi } from "@renderer/api/api-keys";
import { Field, FieldError, FieldLabel } from "@renderer/components/ui/field";
import { Input } from "@renderer/components/ui/input";
import { getErrorMessage } from "@renderer/utils/helpers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { ApiKeySchema } from "../../../../../schemas/ApiKeySchema";
import { OnboardingButton } from "../onboarding-button";
import { StepLayout } from "../step-layout";
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
    <StepLayout
      title="Do you have an OpenRouter API key?"
      description="Connect your key to power Recall’s AI agent."
      footer={
        <div className="flex w-full justify-between gap-4">
          <OnboardingButton form="api-key" type="submit" disabled={isPending}>
            Continue
          </OnboardingButton>
          <OnboardingButton
            onClick={onNext}
            variant="ghost"
            className="text-muted-foreground flex items-center gap-2"
          >
            <span>Skip for now</span>
          </OnboardingButton>
        </div>
      }
    >
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </form>
    </StepLayout>
  );
}
