import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/component/Ui/card.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/component/Ui/tabs.tsx";
import { Button } from "@/component/Ui/button.tsx";
import { ChevronLeft, Calendar, Clock, BookOpen, Award } from "lucide-react";
import LoginForm from "@/component/Auth/LoginForm.tsx";
import PhoneLoginForm from "@/component/Auth/PhoneLoginForm.tsx";
import SignupForm from "@/component/Auth/SignupForm.tsx";
import OAuthButtons from "@/component/Auth/OAuthButtons.tsx";
import PasswordRecovery from "@/component/Auth/PasswordRecovery.tsx";
import { LanguageSelector } from "@/component/Ui/language-selector.tsx";
import { useI18n } from "@/hook/useI18n.ts";
import VerificationCodeForm from "@/component/Auth/VerificationCodeForm.tsx";

type AuthView = "login" | "recovery" | "register" | "verification";

const Auth = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialView =
      queryParams.get("view") === "register" ? "register" : "login";

  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isExistingInactiveUser, setIsExistingInactiveUser] = useState(false);
  const { t } = useI18n();

  const handleForgotPassword = () => {
    setCurrentView("recovery");
  };

  const handleSuccessfulSignup = (email: string, isExisting = false) => {
    console.log(
        "Successful signup for email:",
        email,
        "Existing user:",
        isExisting,
    );
    setVerificationEmail(email);
    setIsExistingInactiveUser(isExisting);
    setCurrentView("verification");
  };

  const handleVerificationSuccess = () => {
    console.log("Verification successful, switching to login view");
    setCurrentView("login");
    setIsExistingInactiveUser(false);
  };

  return (
      <div className="min-h-screen bg-gradient-to-b from-background flex items-center justify-center p-4 istui-timetable__auth_container">
        <div className="absolute top-4 right-4 istui-timetable__auth_container_language-select">
          <LanguageSelector />
        </div>

        <div className="absolute top-4 left-4 istui-timetable__auth_container_back-button">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              {t("auth.backToLanding")}
            </Button>
          </Link>
        </div>

        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 max-w-6xl py-8 istui-timetable__auth_container_card">
          <div className="lg:w-1/2 w-full px-4 lg:px-8 istui-timetable__auth_container_card_left">
            <div className="flex justify-center lg:justify-start mb-4">
              <Calendar className="h-16 w-16 text-primary" />
            </div>

            <h1 className="text-3xl font-bold text-center lg:text-left">
              {t("auth.systemName")}
            </h1>

            <p className="text-center lg:text-left text-muted-foreground mt-4">
              {t("auth.systemDescription")}
            </p>

            <div className="w-full my-8 hidden md:block">
              <svg
                  viewBox="0 0 800 400"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto"
              >
                <rect
                    x="0"
                    y="0"
                    width="800"
                    height="400"
                    fill="#f8f9fa"
                    rx="20"
                />
                <rect
                    x="100"
                    y="80"
                    width="600"
                    height="280"
                    fill="#ffffff"
                    stroke="#e2e8f0"
                    strokeWidth="2"
                    rx="8"
                />
                <rect
                    x="100"
                    y="80"
                    width="600"
                    height="40"
                    fill="#f1f5f9"
                    stroke="#e2e8f0"
                    strokeWidth="2"
                    rx="8"
                />

                <text
                    x="150"
                    y="105"
                    fontSize="14"
                    fontWeight="bold"
                    fill="#64748b"
                >
                  {t("common.monday")}
                </text>
                <text
                    x="250"
                    y="105"
                    fontSize="14"
                    fontWeight="bold"
                    fill="#64748b"
                >
                  {t("common.tuesday")}
                </text>
                <text
                    x="350"
                    y="105"
                    fontSize="14"
                    fontWeight="bold"
                    fill="#64748b"
                >
                  {t("common.wednesday")}
                </text>
                <text
                    x="450"
                    y="105"
                    fontSize="14"
                    fontWeight="bold"
                    fill="#64748b"
                >
                  {t("common.thursday")}
                </text>
                <text
                    x="550"
                    y="105"
                    fontSize="14"
                    fontWeight="bold"
                    fill="#64748b"
                >
                  {t("common.friday")}
                </text>

                <rect
                    x="100"
                    y="120"
                    width="50"
                    height="240"
                    fill="#f1f5f9"
                    stroke="#e2e8f0"
                    strokeWidth="2"
                />
                <text x="110" y="145" fontSize="12" fill="#64748b">
                  8:00
                </text>
                <text x="110" y="185" fontSize="12" fill="#64748b">
                  10:00
                </text>
                <text x="110" y="225" fontSize="12" fill="#64748b">
                  12:00
                </text>
                <text x="110" y="265" fontSize="12" fill="#64748b">
                  14:00
                </text>
                <text x="110" y="305" fontSize="12" fill="#64748b">
                  16:00
                </text>
                <text x="110" y="345" fontSize="12" fill="#64748b">
                  18:00
                </text>

                <line
                    x1="150"
                    y1="120"
                    x2="150"
                    y2="360"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                />
                <line
                    x1="250"
                    y1="120"
                    x2="250"
                    y2="360"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                />
                <line
                    x1="350"
                    y1="120"
                    x2="350"
                    y2="360"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                />
                <line
                    x1="450"
                    y1="120"
                    x2="450"
                    y2="360"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                />
                <line
                    x1="550"
                    y1="120"
                    x2="550"
                    y2="360"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                />
                <line
                    x1="650"
                    y1="120"
                    x2="650"
                    y2="360"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                />

                <line
                    x1="100"
                    y1="160"
                    x2="700"
                    y2="160"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                />
                <line
                    x1="100"
                    y1="200"
                    x2="700"
                    y2="200"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                />
                <line
                    x1="100"
                    y1="240"
                    x2="700"
                    y2="240"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                />
                <line
                    x1="100"
                    y1="280"
                    x2="700"
                    y2="280"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                />
                <line
                    x1="100"
                    y1="320"
                    x2="700"
                    y2="320"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                />

                <rect
                    x="150"
                    y="160"
                    width="100"
                    height="40"
                    fill="#bfdbfe"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    rx="4"
                    opacity="0.9"
                >
                  <animate
                      attributeName="opacity"
                      values="0.7;0.9;0.7"
                      dur="3s"
                      repeatCount="indefinite"
                  />
                </rect>
                <text
                    x="155"
                    y="182"
                    fontSize="12"
                    fontWeight="bold"
                    fill="#1e40af"
                >
                  {t("subject.physics")}
                </text>
                <text x="155" y="196" fontSize="10" fill="#1e40af">
                  {t("room.label")} 101
                </text>

                <rect
                    x="350"
                    y="200"
                    width="100"
                    height="80"
                    fill="#c7d2fe"
                    stroke="#6366f1"
                    strokeWidth="2"
                    rx="4"
                    opacity="0.9"
                >
                  <animate
                      attributeName="opacity"
                      values="0.7;0.9;0.7"
                      dur="2.5s"
                      repeatCount="indefinite"
                  />
                </rect>
                <text
                    x="355"
                    y="235"
                    fontSize="12"
                    fontWeight="bold"
                    fill="#3730a3"
                >
                  {t("subject.mathematics")}
                </text>
                <text x="355" y="249" fontSize="10" fill="#3730a3">
                  {t("room.label")} 203
                </text>

                <rect
                    x="550"
                    y="240"
                    width="100"
                    height="40"
                    fill="#bbf7d0"
                    stroke="#22c55e"
                    strokeWidth="2"
                    rx="4"
                    opacity="0.9"
                >
                  <animate
                      attributeName="opacity"
                      values="0.7;0.9;0.7"
                      dur="3.5s"
                      repeatCount="indefinite"
                  />
                </rect>
                <text
                    x="555"
                    y="262"
                    fontSize="12"
                    fontWeight="bold"
                    fill="#166534"
                >
                  {t("subject.biology")}
                </text>
                <text x="555" y="276" fontSize="10" fill="#166534">
                  {t("room.lab")} 3
                </text>

                <rect
                    x="250"
                    y="280"
                    width="100"
                    height="40"
                    fill="#fde68a"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    rx="4"
                    opacity="0.9"
                >
                  <animate
                      attributeName="opacity"
                      values="0.7;0.9;0.7"
                      dur="2.8s"
                      repeatCount="indefinite"
                  />
                </rect>
                <text
                    x="255"
                    y="302"
                    fontSize="12"
                    fontWeight="bold"
                    fill="#92400e"
                >
                  {t("subject.chemistry")}
                </text>
                <text x="255" y="316" fontSize="10" fill="#92400e">
                  {t("room.lab")} 2
                </text>

                <rect
                    x="450"
                    y="120"
                    width="100"
                    height="40"
                    fill="#fed7aa"
                    stroke="#ea580c"
                    strokeWidth="2"
                    rx="4"
                    opacity="0.9"
                >
                  <animate
                      attributeName="opacity"
                      values="0.7;0.9;0.7"
                      dur="3.2s"
                      repeatCount="indefinite"
                  />
                </rect>
                <text
                    x="455"
                    y="142"
                    fontSize="12"
                    fontWeight="bold"
                    fill="#9a3412"
                >
                  {t("subject.english")}
                </text>
                <text x="455" y="156" fontSize="10" fill="#9a3412">
                  {t("room.label")} 305
                </text>

                <circle cx="400" cy="250" r="6" fill="#3b82f6">
                  <animate
                      attributeName="cx"
                      values="200;500;300;400;200"
                      dur="10s"
                      repeatCount="indefinite"
                  />
                  <animate
                      attributeName="cy"
                      values="180;220;300;250;180"
                      dur="10s"
                      repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-6">
              <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105">
                <Clock className="h-10 w-10 text-primary mb-2" />
                <span className="text-sm font-semibold">{t("auth.feature.efficientPlanning")}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("auth.feature.efficientPlanningDesc")}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105">
                <BookOpen className="h-10 w-10 text-primary mb-2" />
                <span className="text-sm font-semibold">{t("auth.feature.classManagement")}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("auth.feature.classManagementDesc")}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105">
                <Award className="h-10 w-10 text-primary mb-2" />
                <span className="text-sm font-semibold">{t("auth.feature.aiOptimization")}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("auth.feature.aiOptimizationDesc")}
                </p>
              </div>
            </div>
          </div>

          <Card className="w-full lg:w-1/2 max-w-md p-6 shadow-lg istui-timetable__auth_container_card_right">
            {currentView === "recovery" ? (
                <PasswordRecovery onBack={() => setCurrentView("login")} />
            ) : currentView === "verification" ? (
                <VerificationCodeForm
                    email={verificationEmail}
                    onBack={() => setCurrentView("register")}
                    onVerificationSuccess={handleVerificationSuccess}
                    isExistingInactiveUser={isExistingInactiveUser}
                />
            ) : currentView === "register" ? (
                <>
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold">
                      {t("auth.createAccount")}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("auth.fillDetails")}
                    </p>
                  </div>
                  <SignupForm onSuccessfulSignup={handleSuccessfulSignup} />
                  <div className="mt-6">
                    <OAuthButtons isSignUp={true} />
                  </div>
                </>
            ) : (
                <>
                  <Tabs defaultValue="email" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="email">{t("auth.email")}</TabsTrigger>
                      <TabsTrigger value="phone">{t("auth.phone")}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="email">
                      <LoginForm onForgotPassword={handleForgotPassword} />
                    </TabsContent>
                    <TabsContent value="phone">
                      <PhoneLoginForm />
                    </TabsContent>
                  </Tabs>
                  <div className="mt-6">
                    <OAuthButtons />
                  </div>
                </>
            )}
          </Card>
        </div>

        <div className="fixed bottom-6 text-center w-full">
          <p className="text-sm text-muted-foreground">
            {currentView === "login"
                ? t("auth.noAccount")
                : t("auth.alreadyHaveAccount")}{" "}
            <button
                className="text-primary underline underline-offset-4 hover:text-primary/90"
                onClick={() =>
                    setCurrentView(currentView === "login" ? "register" : "login")
                }
            >
              {currentView === "login" ? t("auth.signUp") : t("auth.signIn")}
            </button>
          </p>
        </div>
      </div>
  );
};

export default Auth;
