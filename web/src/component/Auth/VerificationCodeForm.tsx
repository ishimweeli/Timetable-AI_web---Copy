import React, { useState, useRef, useEffect } from "react";
import type { Timeout } from "node:timers";
import { Button } from "@/component/Ui/button";
import { Input } from "@/component/Ui/input";
import { useToast } from "@/component/Ui/use-toast";
import { useI18n } from "@/hook/useI18n";
import {
  useVerifyCodeMutation,
  useResendCodeMutation,
} from "@/store/Auth/ApiAuth";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/component/Ui/alert";
import { AlertCircle } from "lucide-react";
import { Spinner } from "@/component/Ui/spinner";

interface VerificationCodeFormProps {
  email: string;
  onBack?: () => void;
  onVerificationSuccess?: () => void;
  isExistingInactiveUser?: boolean;
}

const VerificationCodeForm: React.FC<VerificationCodeFormProps> = ({
  email,
  onBack,
  onVerificationSuccess,
  isExistingInactiveUser = false,
}) => {
  const [code, setCode] = useState<string[]>(new Array(6).fill(""));
  const [cooldown, setCooldown] = useState(0);
  const [codeExpired, setCodeExpired] = useState(isExistingInactiveUser);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [verifyCode, { isLoading: isVerifying }] = useVerifyCodeMutation();
  const [resendCode, { isLoading: isResending }] = useResendCodeMutation();

  useEffect(() => {
    // If this is an existing inactive user, we should prompt them to request a new code
    if(isExistingInactiveUser) {
      setCodeExpired(true);
    }
  }, [isExistingInactiveUser]);

  useEffect(() => {
    let timer: Timeout;
    if(cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleCodeChange = (index: number, value: string) => {
    if(value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if(value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if(e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);

    if(digits.length === 0) return;

    const newCode = [...code];

    if(digits.length === 6) {
      for(let i = 0; i < 6; i++) {
        newCode[i] = digits[i];
      }
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }else {
      for(let i = 0; i < digits.length && index + i < 6; i++) {
        newCode[index + i] = digits[i];
      }
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const verificationCode = code.join("");

    if(verificationCode.length !== 6) {
      toast({
        description: t("auth.verification.completeSixDigits"),
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await verifyCode({
        email,
        code: verificationCode,
        type: "REGISTRATION",
      }).unwrap();

      if(response.success) {
        toast({
          description:
            response.message || t("auth.verification.accountActivated"),
          variant: "default",
        });

        setCodeExpired(false);

        if(onVerificationSuccess) {
          onVerificationSuccess();
        }
      }else {
        toast({
          description: response.message || t("auth.verification.tryAgain"),
          variant: "destructive",
        });
      }
    }catch(error: any) {
      const errorMessage = error?.data?.error || "Verification failed";
      setCodeExpired(true);
      toast({
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleResendCode = async () => {
    if(cooldown > 0) return;

    try {
      const response = await resendCode({ email }).unwrap();

      if(response.success) {
        setCodeExpired(false);
        setCooldown(60);
        setCode(new Array(6).fill(""));
        toast({
          description: response.message || t("auth.verification.checkEmail"),
          variant: "default",
        });
      }
    }catch(error: any) {
      if(error.status === 400 && error.data && error.data.error) {
        const errorMessage = error.data.error;
        toast({
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if(error.errorMessage) {
        toast({
          description: error.errorMessage || t("auth.verification.tryAgain"),
          variant: "destructive",
        });
        return;
      }

      toast({
        description: t("auth.verification.tryAgain"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{t("auth.verification.title")}</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {t("auth.verification.description", { email })}
        </p>
      </div>

      {isExistingInactiveUser && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {t("auth.verification.existingInactiveUser")}
          </AlertDescription>
        </Alert>
      )}

      {codeExpired && !isExistingInactiveUser && (
        <p className="mt-2 text-destructive font-medium text-center">
          {t("auth.verification.invalidOrExpiredCode")}
        </p>
      )}

      <div className="flex justify-center space-x-2 ">
        {code.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength={1}
            pattern="\d*"
            inputMode="numeric"
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={(e) => handlePaste(index, e)}
            className={`w-12 h-12 text-center text-xl ${codeExpired ? "border-destructive" : ""}`}
            placeholder="-"
          />
        ))}
      </div>

      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isVerifying || isResending}
        >
          {t("auth.back")}
        </Button>
        <Button
          onClick={handleVerifyCode}
          disabled={
            isVerifying ||
            isResending ||
            (isExistingInactiveUser && !code.some((digit) => digit))
          }
          className="min-w-[120px]"
        >
          {isVerifying
            ? t("auth.verification.verifying")
            : t("auth.verification.verify")}
        </Button>
      </div>

      <div className="text-center">
        <Button
          variant={codeExpired ? "default" : "link"}
          onClick={handleResendCode}
          disabled={cooldown > 0 || isVerifying || isResending}
          className={codeExpired ? "animate-pulse" : ""}
        >
          {cooldown > 0 ? (
            t("auth.verification.resendIn", { seconds: `${cooldown}` })
          ) : isResending ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              {t("auth.verification.resending")}
            </div>
          ) : (
            t("auth.verification.resendCode")
          )}
        </Button>
      </div>
    </div>
  );
};

export default VerificationCodeForm;
