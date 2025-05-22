import React from "react";
import { useI18n } from "@/hook/useI18n";
import { useAppDispatch } from "@/hook/useAppRedux";
import { getCurrentOrganizationInfo } from "@/component/Binding/OrganizationSelector";
import { useNavigate } from "react-router-dom";

// Layout components
import Header from "@/component/Core/layout/Header";
import Sidebar from "@/component/Core/layout/Sidebar";
import Breadcrumbs from "@/component/Core/navigation/Breadcrumbs";
import SearchReplaceForm from "@/component/Binding/SearchReplaceForm";

// UI components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/component/Ui/card";
import { Button } from "@/component/Ui/button";
import { Building, MapPin, ArrowLeft } from "lucide-react";

const PageSearchReplace = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Current organization from localStorage
  const {
    name: initialOrgName,
    address: initialOrgAddress,
    district: initialOrgDistrict
  } = getCurrentOrganizationInfo();

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto">
            <Breadcrumbs
              items={[
                { label: t("navigation.resources"), href: "/resources" },
                { label: t("binding.title"), href: "" },
                { label: t("binding.search.title"), href: "" },
              ]}
            />

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">{t("binding.search.title")}</h1>
                <p className="text-muted-foreground mt-1">
                  {t("binding.search.description")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/bindings")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("common.back")}
              </Button>
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Building className="h-6 w-6 text-primary" />
                  <div>
                    <h2 className="text-xl font-semibold">{initialOrgName}</h2>
                    {initialOrgDistrict && (
                      <div className="text-muted-foreground text-sm">
                        {initialOrgDistrict}
                      </div>
                    )}
                    {initialOrgAddress && (
                      <div className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        {initialOrgAddress}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <SearchReplaceForm />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageSearchReplace;