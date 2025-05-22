import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/component/Ui/button";
import { Input } from "@/component/Ui/input";
import { Label } from "@/component/Ui/label";
import { useToast } from "@/hook/useToast.ts";
import { useI18n } from "@/hook/useI18n";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useRegisterMutation,
  useLazyCheckEmailQuery,
} from "@/store/Auth/ApiAuth";
import { RegisterRequest } from "@/type/Auth/TypeAuth.ts";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "@/style/Auth/phone-input.css";

interface SignupFormProps {
  onSuccessfulSignup?: (email: string, isExisting?: boolean) => void;
}

const SignupForm = ({ onSuccessfulSignup }: SignupFormProps) => {
  const { toast } = useToast();
  const { t } = useI18n();
  const [register, { isLoading }] = useRegisterMutation();
  const [checkEmail, { isLoading: isEmailCheckLoading }] =
    useLazyCheckEmailQuery();
  const [emailExists, setEmailExists] = useState(false);
  const [isInactiveUser, setIsInactiveUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formSchema = z
    .object({
      firstName: z.string().min(1, { message: t("form.required") }),
      lastName: z.string().min(1, { message: t("form.required") }),
      email: z.string().email({ message: t("auth.invalidEmail") }),
      password: z.string().min(8, { message: t("auth.passwordTooShort") }),
      confirmPassword: z.string(),
      phone: z
        .string()
        .optional()
        .refine((value) => !value || isValidPhoneNumber(value), {
          message: t("auth.invalidPhone"),
        }),
      organizationName: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });

  type SignupFormData = z.infer<typeof formSchema>;

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    setError,
    control,
    watch,
    clearErrors,
    getValues,
  } = useForm<SignupFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      organizationName: "",
    },
  });

  const watchedEmail = watch("email");
  const checkEmailExists = async (email: string) => {
    if(!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return;

    try {
      const response = await checkEmail(email).unwrap();

      if(response.exists) {
        if(response.isInactive) {
          setIsInactiveUser(true);
          setEmailExists(false);
          if(errors.email) {
            clearErrors("email");
          }
        }else {
          setEmailExists(true);
          setIsInactiveUser(false);
          setError("email", {
            type: "manual",
            message: t("auth.emailAlreadyExists"),
          });
        }
      }else {
        setEmailExists(false);
        setIsInactiveUser(false);
        if(errors.email) {
          clearErrors("email");
        }
      }
    }catch(error) {
      setEmailExists(false);
      setIsInactiveUser(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if(watchedEmail && watchedEmail.includes("@")) {
        checkEmailExists(watchedEmail);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedEmail]);

  const onSubmit = async (data: SignupFormData) => {
    if(emailExists && !isInactiveUser) {
      setError("email", {
        type: "manual",
        message: t("auth.emailAlreadyExists"),
      });
      return;
    }

    const { confirmPassword, ...registrationData } = data;

    try {
      const registerRequest: RegisterRequest = {
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        password: registrationData.password,
        phone: registrationData.phone || undefined,
        organizationName: registrationData.organizationName || undefined,
      };

      const response = await register(registerRequest).unwrap();

      if(response.success) {
        let toastMessage = response.message || t("auth.accountCreated");

        const isExistingInactiveUser =
          response.message?.includes("needs verification") ||
          response.needsVerification ||
          response.data?.needsVerification ||
          isInactiveUser;

        if(isExistingInactiveUser) {
          toastMessage = t("auth.verification.existingInactiveUser");
        }

        toast({
          description: toastMessage,
          variant: isExistingInactiveUser ? "destructive" : "default",
        });

        if(onSuccessfulSignup) {
          onSuccessfulSignup(registrationData.email, isExistingInactiveUser);
        }
      }else {
        toast({
          description:
            response.message || response.error || t("auth.signupFailed"),
          variant: "destructive",
        });
      }
    }catch(error: any) {
      const errorResponse = error.data;

      const errorMessage = errorResponse?.error || t("auth.signupFailed");

      if(errorMessage.includes("Email already exists")) {
        setError("email", {
          type: "manual",
          message: t("auth.emailAlreadyExists"),
        });

        toast({
          description: t("auth.emailAlreadyExists"),
          variant: "destructive",
        });
        return;
      }

      if(errorMessage.includes("Organization already exists")) {
        setError("organizationName", {
          type: "manual",
          message: t("auth.organizationAlreadyExists"),
        });

        toast({
          description: t("auth.organizationAlreadyExists"),
          variant: "destructive",
        });
        return;
      }

      toast({
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleInactiveAccount = (email: string) => {
    if(onSuccessfulSignup) {
      onSuccessfulSignup(email, true);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-md mx-auto"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="firstName"
            className="text-sm font-medium istui-timetable__auth_container_card__signup_form_input_label"
          >
            {t("auth.firstName")}
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder={t("auth.firstNamePlaceholder")}
            className="w-full istui-timetable__auth_container_card__signup_form_input"
            {...registerField("firstName")}
          />
          {errors.firstName && (
            <p className="text-xs text-destructive mt-1 istui-timetable__auth_container_card__signup_form_input_label_error">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="lastName"
            className="text-sm font-medium istui-timetable__auth_container_card__signup_form_input_label "
          >
            {t("auth.lastName")}
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder={t("auth.lastNamePlaceholder")}
            className="w-full istui-timetable__auth_container_card__signup_form_input "
            {...registerField("lastName")}
          />
          {errors.lastName && (
            <p className="text-xs text-destructive mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="text-sm font-medium istui-timetable__auth_container_card__signup_form_input_label"
        >
          {t("auth.email")}
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder={t("auth.emailPlaceholder")}
            className={`w-full ${emailExists ? "border-destructive" : isInactiveUser ? "border-amber-400" : "istui-timetable__auth_container_card__signup_form_input"}`}
            {...registerField("email")}
            onBlur={(e) => {
              if(e.target.value) checkEmailExists(e.target.value);
            }}
          />
          {isEmailCheckLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg
                className="animate-spin h-4 w-4 text-muted-foreground"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          )}
          {emailExists && !isEmailCheckLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-destructive"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
          {isInactiveUser && !isEmailCheckLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
        {errors.email && (
          <p className="text-xs text-destructive mt-1 istui-timetable__auth_container_card__signup_form_input_label_error">
            {errors.email.message}
          </p>
        )}
        {isInactiveUser && !errors.email && (
          <div className="mt-2 p-3 bg-amber-50 border border-main rounded-md">
            <div className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-amber-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="space-y-2 flex-1">
                <p className="text-xs text-amber-700">
                  {t("auth.verification.inactiveAccountContinue")}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300"
                  onClick={() => handleInactiveAccount(getValues("email"))}
                >
                  {t("auth.verification.goToVerification")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="phone"
          className="text-sm font-medium istui-timetable__auth_container_card__signup_form_input"
        >
          {t("auth.phone")}
        </Label>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <div
              className={`rounded-md border ${errors.phone ? "border-destructive" : "border-input"} bg-background px-3 py-2`}
            >
              <PhoneInput
                international
                countryCallingCodeEditable={false}
                defaultCountry="US"
                placeholder={t("auth.phoneNumber")}
                value={field.value}
                onChange={field.onChange}
                className={
                  errors.phone
                    ? "error"
                    : "istui-timetable__auth_container_card__signup_form_input"
                }
              />
            </div>
          )}
        />
        {errors.phone && (
          <p className="text-xs text-destructive mt-1 istui-timetable__auth_container_card__signup_form_input_label_error">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="organizationName"
          className="text-sm font-medium istui-timetable__auth_container_card__signup_form_input_label"
        >
          {t("auth.organizationName")}
        </Label>
        <Input
          id="organizationName"
          type="text"
          placeholder={t("auth.organizationNamePlaceholder")}
          className="w-full istui-timetable__auth_container_card__signup_form_input"
          {...registerField("organizationName")}
        />
        {errors.organizationName && (
          <p className="text-xs text-destructive mt-1 istui-timetable__auth_container_card__signup_form_input_label_error">
            {errors.organizationName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="password"
            className="text-sm font-medium istui-timetable__auth_container_card__signup_form_input_label"
          >
            {t("auth.password")}
          </Label>
          <span className="text-xs text-muted-foreground">
            Min. 8 characters
          </span>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("auth.passwordPlaceholder")}
            className="w-full pr-10 istui-timetable__auth_container_card__signup_form_input"
            {...registerField("password")}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="confirmPassword"
          className="text-sm font-medium istui-timetable__auth_container_card__signup_form_input_label"
        >
          {t("auth.confirmPassword")}
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder={t("auth.confirmPasswordPlaceholder")}
          className="w-full istui-timetable__auth_container_card__signup_form_input"
          {...registerField("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive mt-1 istui-timetable__auth_container_card__signup_form_input_label_error">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full py-2 font-medium transition-colors istui-timetable__auth_container_card__signup_form_button"
        disabled={isLoading || (emailExists && !isInactiveUser)}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {t("auth.creatingAccount")}
          </span>
        ) : (
          t("auth.createAccount")
        )}
      </Button>
    </form>
  );
};

export default SignupForm;
