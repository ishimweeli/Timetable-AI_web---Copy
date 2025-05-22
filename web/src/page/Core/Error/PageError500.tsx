import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const PageError500 = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error(
        t("common.error.500.log"),
        location.pathname,
    );
  }, [location.pathname, t]);

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{t("common.error.500.code")}</h1>
          <p className="text-xl text-gray-600 mb-4">{t("common.error.500.message")}</p>
          <a
              href="/web/public"
              className="text-blue-500 hover:text-blue-700 underline"
          >
            {t("common.error.returnHome")}
          </a>
        </div>
      </div>
  );
};

export default PageError500;
