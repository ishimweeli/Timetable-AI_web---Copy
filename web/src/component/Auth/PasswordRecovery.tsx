import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/component/Ui/button";
import { Input } from "@/component/Ui/input";
import { Label } from "@/component/Ui/label";
import { useToast } from "@/hook/useToast.ts";
import { useI18n } from "@/hook/useI18n";
import { ArrowLeft } from "lucide-react";

interface RecoveryFormData {
  email: string;
  code?: string;
  newPassword?: string;
  confirmPassword?: string;
}

type RecoveryStep = "email" | "verification" | "reset" | "success";

const PasswordRecovery = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState<RecoveryStep>("email");
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RecoveryFormData>();
  const { toast } = useToast();
  const { t } = useI18n();

  const watchPassword = watch("newPassword", "");

  const onSubmit = async (data: RecoveryFormData) => {
    setIsLoading(true);

    try {
      if(step === "email") {
        // Mock API call to send reset email
        console.log("Sending recovery email to:", data.email);
        toast({
          title: t("auth.recoveryEmailSent"),
          description: t("auth.checkEmail"),
        });
        setStep("verification");
      } else if(step === "verification") {
        // Mock API call to verify code
        console.log("Verifying code:", data.code);
        setStep("reset");
      } else if(step === "reset") {
        // Mock API call to reset password
        console.log("Resetting password");
        toast({
          title: t("auth.passwordReset"),
          description: t("auth.passwordResetSuccess"),
        });
        setStep("success");
      }
    }catch(error) {
      toast({
        title: t("auth.recoveryFailed"),
        description: t("auth.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-0 mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-medium">
          {step === "email" && t("auth.forgotPassword")}
          {step === "verification" && t("auth.verifyCode")}
          {step === "reset" && t("auth.resetPassword")}
          {step === "success" && t("auth.passwordResetComplete")}
        </h2>
      </div>

      {step === "success" ? (
        <div className="text-center space-y-4">
          <p>{t("auth.passwordResetSuccessMessage")}</p>
          <Button onClick={onBack} className="w-full">
            {t("auth.backToLogin")}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {step === "email" && (
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("auth.emailPlaceholder")}
                {...register("email", {
                  required: t("form.required"),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t("auth.invalidEmail"),
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {t("auth.recoveryInstructions")}
              </p>
            </div>
          )}

          {step === "verification" && (
            <div className="space-y-2">
              <Label htmlFor="code">{t("auth.verificationCode")}</Label>
              <Input
                id="code"
                type="text"
                placeholder={t("auth.codePlaceholder")}
                {...register("code", {
                  required: t("form.required"),
                  minLength: {
                    value: 6,
                    message: t("auth.invalidCode"),
                  },
                  maxLength: {
                    value: 6,
                    message: t("auth.invalidCode"),
                  },
                })}
              />
              {errors.code && (
                <p className="text-sm text-destructive">
                  {errors.code.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {t("auth.codeInstructions")}
              </p>
            </div>
          )}

          {step === "reset" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("auth.newPassword")}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder={t("auth.newPasswordPlaceholder")}
                  {...register("newPassword", {
                    required: t("form.required"),
                    minLength: {
                      value: 8,
                      message: t("auth.passwordTooShort"),
                    },
                  })}
                />
                {errors.newPassword && (
                  <p className="text-sm text-destructive">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t("auth.confirmPassword")}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t("auth.confirmPasswordPlaceholder")}
                  {...register("confirmPassword", {
                    required: t("form.required"),
                    validate: (value) =>
                      value === watchPassword || t("auth.passwordsDoNotMatch"),
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? t("auth.processing")
              : step === "email"
                ? t("auth.sendInstructions")
                : step === "verification"
                  ? t("auth.verifyCode")
                  : t("auth.resetPassword")}
          </Button>
        </form>
      )}
    </div>
  );
};

export default PasswordRecovery;
