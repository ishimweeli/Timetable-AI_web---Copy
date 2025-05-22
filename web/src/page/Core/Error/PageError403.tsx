import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/component/Ui/button";
import { useAppSelector } from "@/hook/useAppRedux";
import { useTranslation } from "react-i18next";
import PageError401 from "@/page/Core/Error/PageError401.tsx";

const PageError403 = () => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  useEffect(() => {
    console.error(
        t("common.error.403.log"),
        location.pathname,
    );
  }, [location.pathname, t]);

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{t("common.error.403.code")}</h1>
          <p className="text-xl text-gray-600 mb-4">{t("common.error.403.message")}</p>
          <p className="mb-6 text-gray-500">
            {t("common.error.403.description")}
          </p>

          {isAuthenticated ? (
              <Button asChild variant="default">
                <Link to="/dashboard">{t("common.error.returnDashboard")}</Link>
              </Button>
          ) : (
              <Button asChild variant="default">
                <Link to="/auth">{t("common.error.login")}</Link>
              </Button>
          )}
        </div>
      </div>
  );
};

export default PageError403;
