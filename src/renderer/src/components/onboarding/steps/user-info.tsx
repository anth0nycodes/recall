import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usersApi } from "@renderer/api/users";
import { Button } from "@renderer/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@renderer/components/ui/field";
import { Input } from "@renderer/components/ui/input";
import { getErrorMessage } from "@renderer/utils/helpers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { UserInfoSchema } from "../../../../../schemas/UserInfoSchema";
import { OnboardingStepProps } from "./types";

export function UserInfo({ onNext }: OnboardingStepProps) {
  const inputClasses =
    "text-lg w-52 placeholder:text-lg border-none h-11 placeholder:text-muted-foreground bg-accent";

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (data: z.infer<typeof UserInfoSchema>) =>
      usersApi.updateUserInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onNext();
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      throw new Error(`Failed to update user info: ${errorMessage}`);
    },
  });

  const form = useForm<z.infer<typeof UserInfoSchema>>({
    resolver: zodResolver(UserInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

  function onSubmit(data: z.infer<typeof UserInfoSchema>) {
    mutate(data);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-4">
          <span className="text-center text-4xl font-medium">
            First, what&apos;s your name?
          </span>
          <p className="font-geist text-muted-foreground text-center text-[20px]">
            This helps personalize your experience.
          </p>
        </div>
        <form
          className="font-geist w-full"
          id="user-info-form"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup className="flex w-full flex-row items-center justify-between gap-5">
            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-base" htmlFor="first-name">
                    First Name
                  </FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    className={inputClasses}
                    required
                    id="first-name"
                    type="text"
                    placeholder="First name"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="lastName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-base" htmlFor="last-name">
                    Last Name
                  </FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    className={inputClasses}
                    required
                    id="last-name"
                    type="text"
                    placeholder="Last name"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </div>
      <Button
        form="user-info-form"
        type="submit"
        className="font-geist px-5 py-2 text-lg"
      >
        Continue
      </Button>
    </div>
  );
}
