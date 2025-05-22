import { useForm } from "react-hook-form";
import { Button } from "@/component/Ui/button";
import { Input } from "@/component/Ui/input";
import { Label } from "@/component/Ui/label";
import { useToast } from "@/hook/useToast.ts";
import { useI18n } from "@/hook/useI18n";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/store/Auth/ApiAuth";
import { useAppDispatch } from "@/hook/useAppRedux";
import { setCredentials, setError } from "@/store/Auth/SliceAuth";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginRequest } from "@/type/Auth/TypeAuth.ts";

interface DemoCredentials {
  email: string;
  password: string;
}

interface LoginFormProps {
  onForgotPassword: () => void;
  demoCredentials?: DemoCredentials | null;
}

const LoginForm = ({ onForgotPassword, demoCredentials }: LoginFormProps) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [login, { isLoading }] = useLoginMutation();

  const loginSchema = z.object({
    email: z.string().email({ message: t("auth.invalidEmail") }),
    password: z.string().min(6, { message: t("auth.passwordTooShort") }),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: demoCredentials?.email || "",
      password: demoCredentials?.password || "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const loginData: LoginRequest = {
        email: data.email,
        password: data.password,
      };

      const response = await login(loginData).unwrap();

      if(response.success) {
        const {
          firstName,
          lastName,
          email,
          uuid,
          phone,
          roleId,
          roleName,
          organizationId,
          organization,
          token,
          refreshToken,
        } = response.data;

        // Ensure organizationId is captured properly
        const userOrganizationId = organizationId || organization?.id || null;

        // If we have an organization ID from either source, save it
        if(userOrganizationId) {
          localStorage.setItem(
            "selectedOrganizationId",
            userOrganizationId.toString(),
          );
        }

        dispatch(
          setCredentials({
            user: {
              firstName,
              lastName,
              email,
              uuid,
              phone,
              roleId,
              roleName,
              organizationId: userOrganizationId,
              organization,
            },
            token,
            refreshToken,
          }),
        );

        if(response.message) {
          toast({
            description: response.message,
          });
        }

        // Redirect based on user role to their respective home page
        if(roleName === "STUDENT") {
          navigate("/student-dashboard");
        } else if(roleName === "TEACHER") {
          navigate("/teacher-dashboard");
        } else if(roleName === "MANAGER") {
          navigate("/dashboard");
        } else if(roleName === "ADMIN") {
          navigate("/dashboard");
        }else {
          // Default fallback
          navigate("/dashboard");
        }
      }else {
        dispatch(setError(response.error || ""));
        if(response.error) {
          toast({
            description: response.error,
            variant: "destructive",
          });
        }
      }
    }catch(error: any) {
      const errorMessage =
        error?.data?.error || error?.error || t("auth.loginFailed");

      dispatch(setError(errorMessage));

      toast({
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="istui-timetable__auth_container_card_form_input_label"
        >
          {t("auth.email")}
        </Label>
        <Input
          className="istui-timetable__auth_container_card_form_input"
          id="email"
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive istui-timetable__auth_container_card_form_input_label_error_message">
            {errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label
            htmlFor="password"
            className="istui-timetable__auth_container_card_form_input_label"
          >
            {t("auth.password")}
          </Label>
          {!demoCredentials && (
            <Button
              variant="link"
              size="sm"
              className="px-0 font-normal text-xs istui-timetable__auth_container_card_form_input_label_error_icon"
              type="button"
              onClick={onForgotPassword}
            >
              {t("auth.forgotPassword")}
            </Button>
          )}
        </div>
        <Input
          id="password"
          type="password"
          placeholder={t("auth.passwordPlaceholder")}
          {...register("password")}
          className="istui-timetable__auth_container_card_form_input"
        />
        {errors.password && (
          <p className="text-sm text-destructive istui-timetable__auth_container_card_form_input_label_error_message">
            {errors.password.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full istui-timetable__auth_container_card__login_form_button"
        disabled={isLoading}
      >
        {isLoading ? t("auth.loggingIn") : t("auth.login")}
      </Button>
    </form>
  );
};

export default LoginForm;
