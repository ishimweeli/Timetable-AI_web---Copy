import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/component/Ui/button";
import { Input } from "@/component/Ui/input";
import { Label } from "@/component/Ui/label";
import { useToast } from "@/hook/useToast.ts";
import { useI18n } from "@/hook/useI18n";
import { useLocation, useNavigate } from "react-router-dom";

interface PhoneLoginFormData {
  phoneNumber: string;
  password?: string;
  verificationCode?: string;
}

const PhoneLoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<PhoneLoginFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  // Check for demo parameter to pre-fill credentials
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if(searchParams.get("demo") === "true") {
      setValue("phoneNumber", "+1 555-123-4567");
      setValue("password", "password123");
    }
  }, [location, setValue]);

  const sendVerificationCode = async (phoneNumber: string) => {
    // Mock API call to send verification code
    console.log("Sending verification code to:", phoneNumber);
    toast({
      title: t("auth.codeSent"),
      description: t("auth.checkPhone"),
    });
    setCodeSent(true);
  };

  const onSubmit = async (data: PhoneLoginFormData) => {
    setIsLoading(true);

    try {
      if(!codeSent) {
        await sendVerificationCode(data.phoneNumber);
      }else {
        // Verify code and login
        console.log("Verifying code and logging in:", data);
        toast({
          title: t("auth.loginSuccess"),
          description: t("auth.welcomeBack"),
        });

        // Redirect to dashboard after successful verification
        navigate("/dashboard");

        // Reset form state after successful verification
        reset();
        setCodeSent(false);
      }
    }catch(error) {
      toast({
        title: codeSent
          ? t("auth.verificationFailed")
          : t("auth.sendCodeFailed"),
        description: t("auth.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">{t("auth.phoneNumber")}</Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="+1 (555) 123-4567"
          disabled={codeSent}
          {...register("phoneNumber", {
            required: t("form.required"),
            pattern: {
              value: /^\+?[0-9\s\-()]+$/,
              message: t("auth.invalidPhone"),
            },
          })}
        />
        {errors.phoneNumber && (
          <p className="text-sm text-destructive">
            {errors.phoneNumber.message}
          </p>
        )}
      </div>

      {codeSent ? (
        <div className="space-y-2">
          <Label htmlFor="verificationCode">{t("auth.verificationCode")}</Label>
          <Input
            id="verificationCode"
            type="text"
            placeholder="123456"
            {...register("verificationCode", {
              required: t("form.required"),
              minLength: {
                value: 4,
                message: t("auth.invalidCode"),
              },
              maxLength: {
                value: 6,
                message: t("auth.invalidCode"),
              },
            })}
          />
          {errors.verificationCode && (
            <p className="text-sm text-destructive">
              {errors.verificationCode.message}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input
            id="password"
            type="password"
            placeholder={t("auth.passwordPlaceholder")}
            {...register("password", { required: t("form.required") })}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading
          ? codeSent
            ? t("auth.verifying")
            : t("auth.sendingCode")
          : codeSent
            ? t("auth.verify")
            : t("auth.sendCode")}
      </Button>

      {codeSent && (
        <Button
          type="button"
          variant="outline"
          className="w-full mt-2"
          onClick={() => setCodeSent(false)}
        >
          {t("auth.useAnotherPhone")}
        </Button>
      )}
    </form>
  );
};

export default PhoneLoginForm;
