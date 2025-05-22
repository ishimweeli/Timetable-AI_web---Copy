import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Activity,
  Clock,
  Filter,
  PieChart,
  LayoutDashboard,
  Sliders,
  Bell,
  FileText,
  BookOpen,
  School,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/component/Ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/component/Ui/tabs";
import { Button } from "@/component/Ui/button";
import { Badge } from "@/component/Ui/badge";
import { Progress } from "@/component/Ui/progress";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hook/useI18n";
import { useGetOrgStatisticsQuery } from "@/services/dashboard/ApiDashboard";
import {
  selectOrgStats,
  selectOrgStatsIsLoading,
  selectOrgStatsError
} from "@/store/dashboard/SliceDashboard";
import { useAppSelector } from "@/hook/useAppRedux";

const IndexManager = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("dashboard");
  const form = useForm();

  
  const { refetch: refetchOrgStats } = useGetOrgStatisticsQuery();

 
  const orgStats = useAppSelector(selectOrgStats);
  const isLoadingOrgStats = useAppSelector(selectOrgStatsIsLoading);


  useEffect(() => {
    
    refetchOrgStats();
  }, [refetchOrgStats]);

  return (
      <div className="flex h-screen bg-background-main istui-timetable__dashboard_page">
        <div className="flex-1 flex flex-col istui-timetable__dashboard_main">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 istui-timetable__dashboard_container">
            <div className="container-main mx-auto istui-timetable__dashboard_content">
              <div className="flex items-center mb-6 istui-timetable__dashboard_header">
                <LayoutDashboard className="h-6 w-6 mr-2 text-primary" />
                <h1 className="text-3xl font-bold istui-timetable__dashboard_title">
                  {t("common.dashboard.title")} - {t("common.dashboard.roles.managers")}
                </h1>
              </div>

            

              <Tabs
                  defaultValue="dashboard"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full istui-timetable__dashboard_tabs"
              >
                <TabsList className="w-full mb-6 istui-timetable__dashboard_tabs_list hidden">
                  <TabsTrigger
                      value="dashboard"
                      className="flex items-center gap-2 istui-timetable__dashboard_tab_trigger"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {t("common.dashboard.overview")}
                  </TabsTrigger>
                </TabsList>

               
                <TabsContent
                    value="dashboard"
                    className="mt-0 space-y-6 istui-timetable__dashboard_tab_content"
                >
               
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 istui-timetable__dashboard_stats_grid">
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-black text-base font-medium flex justify-between items-center istui-timetable__dashboard_card_title">
                          {t("common.dashboard.stats.activeUsers")}
                          <Users className="h-4 w-4 text-purple-600" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex items-center gap-2">
                          <div className="text-3xl font-bold text-purple-800">
                            {isLoadingOrgStats ? "..." : orgStats.countUser}
                          </div>
                          <Badge
                              variant="outline"
                              className="bg-purple-100 text-purple-800 h-6 border-purple-300"
                          >
                            {t("common.dashboard.labels.users")}
                          </Badge>
                        </div>
                        <p className="text-xs text-purple-600">{t("common.dashboard.labels.total")}</p>
                      </CardContent>
                    </Card>

                   

                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-black text-base font-medium flex justify-between items-center istui-timetable__dashboard_card_title">
                          {t("common.dashboard.stats.timetablesGenerated")}
                          <Calendar className="h-4 w-4 text-amber-600" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex items-center gap-2">
                          <div className="text-3xl font-bold text-amber-800">
                            {isLoadingOrgStats ? "..." : orgStats.countTimetable}
                          </div>
                          <Badge
                              variant="outline"
                              className="bg-amber-100 text-amber-800 h-6 border-amber-300"
                          >
                            {t("common.dashboard.labels.timetables")}
                          </Badge>
                        </div>
                        <p className="text-xs text-amber-600">{t("common.dashboard.labels.total")}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-black text-base font-medium flex justify-between items-center istui-timetable__dashboard_card_title">
                          {t("common.dashboard.stats.upcomingSchedules")}
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex items-center gap-2">
                          <div className="text-3xl font-bold text-blue-800">
                            3
                          </div>
                          <Badge
                              variant="outline"
                              className="bg-blue-100 text-blue-800 h-6 border-blue-300"
                          >
                            {t("common.dashboard.labels.pending")}
                          </Badge>
                        </div>
                        <p className="text-xs text-blue-600">{t("common.dashboard.labels.nextWeek")}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 istui-timetable__dashboard_charts_grid">
                    <Card className="lg:col-span-1 border-violet-200 istui-timetable__dashboard_card istui-timetable__dashboard_chart_card">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-base font-medium flex items-center">
                          <PieChart className="h-4 w-4 mr-2 text-violet-600" />
                          {t("common.dashboard.charts.usersByRole")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{t("common.dashboard.roles.teachers")}</span>
                              <span className="font-semibold">{isLoadingOrgStats ? "..." : orgStats.countTeacher}</span>
                            </div>
                            <Progress
                                value={isLoadingOrgStats ? 0 : (orgStats.countTeacher / orgStats.countUser) * 100}
                                className="h-2 bg-violet-100"
                                indicatorColor="bg-progress"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{t("common.dashboard.roles.students")}</span>
                              <span className="font-semibold">{isLoadingOrgStats ? "..." : orgStats.countStudent}</span>
                            </div>
                            <Progress
                                value={isLoadingOrgStats ? 0 : (orgStats.countStudent / orgStats.countUser) * 100}
                                className="h-2 bg-violet-100"
                                indicatorColor="bg-progress"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                   
                    <Card className="border-main istui-timetable__dashboard_card istui-timetable__dashboard_table_card">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-base font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-amber-600" />
                          {t("common.dashboard.charts.timetableGenerationStats")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{t("common.dashboard.stats.successRate")}</span>
                            </div>
                            <span className="font-semibold">100%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span>{t("common.dashboard.stats.failureRate")}</span>
                            </div>
                            <span className="font-semibold">0%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span>{t("common.dashboard.stats.avgGenerationTime")}</span>
                            </div>
                            <span className="font-semibold">0 min</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-purple-500" />
                              <span>{t("common.dashboard.stats.schedulesGeneratedToday")}</span>
                            </div>
                            <span className="font-semibold">0</span>
                          </div>

                          <div className="pt-2 mt-2 border-t border-gray-100">
                            <Button
                                className="w-full bg-primary bg-primary--hover text-white flex items-center justify-center gap-2"
                                asChild
                            >
                              <a href="/plansetting">
                                <Sliders className="h-4 w-4" />
                                <span>{t("common.dashboard.actions.managePlanSettings")}</span>
                              </a>
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1">
                              {t("common.dashboard.descriptions.planSettingsDescription")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
  );
};

export default IndexManager;
