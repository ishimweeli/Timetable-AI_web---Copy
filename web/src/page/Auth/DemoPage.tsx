import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/component/Ui/card.tsx";
import { Button } from "@/component/Ui/button.tsx";
import {
  ChevronLeft,
  Calendar,
  Clock,
  BookOpen,
  Award,
  ArrowRight,
} from "lucide-react";
import LoginForm from "@/component/Auth/LoginForm.tsx";
import { LanguageSelector } from "@/component/Ui/language-selector.tsx";
import { useI18n } from "@/hook/useI18n.ts";
import { ThemeToggle } from "@/component/Ui/theme-toggle.tsx";

interface DemoCredentials {
  email: string;
  password: string;
}

const DemoPage = () => {
  const navigate = useNavigate();
  const [demoCredentials] = useState<DemoCredentials>({
    email: "demo@timetabling.ist.com",
    password: "timetable$demo739",
  });
  const { t } = useI18n();

  return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <ThemeToggle />
          <LanguageSelector />
        </div>

        <div className="absolute top-4 left-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              {t("auth.backToLanding")}
            </Button>
          </Link>
        </div>

        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 max-w-6xl py-8">
          <div className="lg:w-1/2 w-full px-4 lg:px-8">
            <div className="flex justify-center lg:justify-start mb-4">
              <Calendar className="h-16 w-16 text-primary" />
            </div>

            <h1 className="text-3xl font-bold text-center lg:text-left">
              {t("auth.demoPage.title")}
            </h1>

            <p className="text-center lg:text-left text-muted-foreground mt-4">
              {t("auth.demoPage.description")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-10">
              <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105">
                <Clock className="h-10 w-10 text-primary mb-2" />
                <span className="text-sm font-semibold">{t("auth.demoPage.features.simpleAccess.title")}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("auth.demoPage.features.simpleAccess.description")}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105">
                <BookOpen className="h-10 w-10 text-primary mb-2" />
                <span className="text-sm font-semibold">{t("auth.demoPage.features.standardLogin.title")}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("auth.demoPage.features.standardLogin.description")}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105">
                <Award className="h-10 w-10 text-primary mb-2" />
                <span className="text-sm font-semibold">{t("auth.demoPage.features.completeSystem.title")}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("auth.demoPage.features.completeSystem.description")}
                </p>
              </div>
            </div>
          </div>

          <Card className="w-full lg:w-1/2 max-w-md p-6 shadow-lg">
            <div className="mb-6 p-4 bg-primary/10 rounded-md">
              <p className="text-sm text-primary font-medium mb-2">{t("auth.demoPage.loginCard.title")}</p>
              <p className="text-xs text-muted-foreground">
                {t("auth.demoPage.loginCard.description")}
              </p>
              <div className="mt-3 p-2 bg-background/80 rounded border border-border">
                <p className="text-xs font-medium">{t("auth.demoPage.loginCard.credentials.title")}:</p>
                <p className="text-xs">{t("auth.demoPage.loginCard.credentials.email")}: {demoCredentials.email}</p>
                <p className="text-xs">{t("auth.demoPage.loginCard.credentials.password")}: {demoCredentials.password}</p>
              </div>
            </div>

            <LoginForm
                onForgotPassword={() => {}}
                demoCredentials={demoCredentials}
            />
          </Card>
        </div>

        <div className="fixed bottom-6 text-center w-full">
          <p className="text-sm text-muted-foreground">
            {t("auth.demoPage.footer.prefix")}
            <Link
                to="/auth?view=register"
                className="text-primary underline underline-offset-4 hover:text-primary/90 mx-1"
            >
              {t("auth.demoPage.footer.createAccount")}
            </Link>
            {t("auth.demoPage.footer.suffix")}
          </p>
        </div>
      </div>
  );
};

export default DemoPage;
