import { Toaster } from "@/component/Ui/toaster";
import { Toaster as Sonner } from "@/component/Ui/sonner";
import { TooltipProvider } from "@/component/Ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/index";
import Index from "@/page/Index";
import IndexManager from "@/page/IndexManager";
import PageTimetable from "@/page/Timetable/PageTimetable.tsx";
import PageManualScheduling from "@/page/Timetable/PageManualScheduling.tsx";
import PageError404 from "@/page/Core/Error/PageError404.tsx";
import PageError401 from "@/page/Core/Error/PageError401.tsx";
import PageError403 from "@/page/Core/Error/PageError403.tsx";
import Auth from "@/page/Auth/Auth.tsx";
import DemoPage from "@/page/Auth/DemoPage.tsx";
import PageTeacher from "@/page/Teacher/PageTeacher.tsx";
import PageClass from "@/page/Class/PageClass.tsx";
import PageRoom from "@/page/Room/PageRoom.tsx";
import PageSubject from "@/page/Subject/PageSubject.tsx";
import PageRule from "@/page/Rule/PageRule.tsx";
import PagePeriod from "@/page/Period/PagePeriod.tsx";
import PageHome from "@/page/Core/Home/PageHome.tsx";
import PageStudent from "@/page/Student/PageStudent.tsx";
import PlanSettingPage from "@/page/Plansetting/PagePlanSettings.tsx";
import IndexTeacherPage from "@/page/IndexTeacher";
import IndexStudentPage from "@/page/IndexStudent";
import { ProviderTheme } from "@/provider/ProviderTheme.tsx";
import { ProviderI18n } from "@/provider/ProviderI18n.tsx";
import { ProviderOrganizationUiSettings } from "@/provider/ProviderOrganizationUiSettings.tsx";
import PageOrganization from "@/page/Organization/PageOrganization.tsx";
import PageClassBand from "./page/ClassBand/PageClassBand";
import PagePlanSettings from "@/page/Plansetting/PagePlanSettings.tsx";
import PageCalendar from "@/page/Calendar/PageCalendar.tsx";
import PrivateRoute from "./component/Auth/PrivateRoute";
import PageManager from "./page/User/PageManager";
import PageBinding from "./page/Binding/PageBinding";
import PageTeacherProfile from "./page/Profile/PageTeacherProfile";
import PageStudentProfile from "./page/Profile/PageStudentProfile";
import PageOrganizationSettings from "./page/Organization/PageOrganizationSettings";
import { useAppSelector } from "@/hook/useAppRedux";
import PageSearchReplace from "./page/Binding/PageSearchReplace";
import MainLayout from "@/component/Core/layout/MainLayout";
import PageTimetableLock from "./page/Timetable/PageTimetableLock";
import PageNotification from "./page/Notification/PageNotification";
import PageLocationChange from "@/page/Settings/PageLocationChange";


const queryClient = new QueryClient();

const DashboardRoute = () => {
  const { user } = useAppSelector((state) => state.auth);

  if(!user) {
    return <Navigate to="/auth" />;
  }

  switch (user.roleName) {
    case "ADMIN":
      return <Index />;
    case "MANAGER":
      return <IndexManager />;
    case "TEACHER":
      return <IndexTeacherPage />;
    case "STUDENT":
      return <IndexStudentPage />;
    default:
      return <Navigate to="/unauthorized" />;
  }
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ProviderI18n>
        <ProviderTheme>
          <ProviderOrganizationUiSettings>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>

                  <Route path="/" element={<PageHome />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/demo" element={<DemoPage />} />

                  <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<MainLayout><DashboardRoute /></MainLayout>} />
                    <Route path="/student-dashboard" element={<MainLayout><IndexStudentPage /></MainLayout>} />
                    <Route path="/teacher-dashboard" element={<MainLayout><IndexTeacherPage /></MainLayout>} />
                  </Route>

                  <Route element={<PrivateRoute />}>
                    <Route path="/timetable" element={<MainLayout><PageTimetable /></MainLayout>} />
                    <Route path="/timetable/view/:id" element={<MainLayout><PageTimetable /></MainLayout>} />
                    <Route path="/timetable/manual/:id" element={<MainLayout><PageManualScheduling /></MainLayout>} />
                    <Route path="/manual-scheduling" element={<MainLayout><PageManualScheduling /></MainLayout>} />
                    <Route path="/manual-scheduling/:id" element={<MainLayout><PageManualScheduling /></MainLayout>} />
                  </Route>

                  <Route element={<PrivateRoute />}>
                    <Route path="/timetable" element={<PageTimetable />} />
                    <Route path="/timetable/:uuid" element={<PageTimetable />} />
                    <Route path="/timetable/lock" element={<PageTimetableLock />} />
                  </Route>

                  <Route element={<PrivateRoute allowedRoles={["STUDENT"]} />}>
                    <Route path="/student-profile" element={<MainLayout><PageStudentProfile /></MainLayout>} />
                  </Route>

                  <Route element={<PrivateRoute allowedRoles={["TEACHER"]} />}>
                    <Route path="/teacher-profile" element={<MainLayout><PageTeacherProfile /></MainLayout>} />
                  </Route>

                  <Route element={<PrivateRoute allowedRoles={["ADMIN", "MANAGER"]} />}>
                    <Route path="/timetable/settings" element={<MainLayout><PagePlanSettings /></MainLayout>} />
                    <Route path="/plansetting" element={<MainLayout><PlanSettingPage /></MainLayout>} />
                    <Route path="/calendar" element={<MainLayout><PageCalendar /></MainLayout>} />
                    <Route path="/plansetting/new" element={<MainLayout><PlanSettingPage /></MainLayout>} />
                    <Route path="/plansetting/:id" element={<MainLayout><PlanSettingPage /></MainLayout>} />
                    <Route path="/teachers" element={<MainLayout><PageTeacher /></MainLayout>} />
                    <Route path="/teachers/:uuid" element={<MainLayout><PageTeacher /></MainLayout>} />
                    <Route path="/classes" element={<MainLayout><PageClass /></MainLayout>} />
                    <Route path="/classes/:uuid" element={<MainLayout><PageClass /></MainLayout>} />
                    <Route path="/rooms" element={<MainLayout><PageRoom /></MainLayout>} />
                    <Route path="/rooms/:uuid" element={<MainLayout><PageRoom /></MainLayout>} />

                    <Route path="/subjects" element={<MainLayout><PageSubject /></MainLayout>} />
                    <Route path="/subjects/:uuid" element={<MainLayout><PageSubject /></MainLayout>} />
                    <Route path="/students" element={<MainLayout><PageStudent /></MainLayout>} />
                    <Route path="/students/:uuid" element={<MainLayout><PageStudent /></MainLayout>} />
                    <Route path="/rules" element={<MainLayout><PageRule /></MainLayout>} />
                    <Route path="/rules/:uuid" element={<MainLayout><PageRule /></MainLayout>} />
                    <Route path="/periods" element={<MainLayout><PagePeriod /></MainLayout>} />
                    <Route path="/periods/:uuid" element={<MainLayout><PagePeriod /></MainLayout>} />
                    <Route path="/classband" element={<MainLayout><PageClassBand /></MainLayout>} />
                    <Route path="/classband/:uuid" element={<MainLayout><PageClassBand /></MainLayout>} />
                    <Route path="/organizations" element={<MainLayout><PageOrganization /></MainLayout>} />
                    <Route path="/organizations/:uuid" element={<MainLayout><PageOrganization /></MainLayout>} />
                    <Route path="/managers" element={<MainLayout><PageManager /></MainLayout>} />
                    <Route path="/managers/:uuid" element={<MainLayout><PageManager /></MainLayout>} />
                    <Route path="/bindings" element={<MainLayout><PageBinding /></MainLayout>} />
                    <Route path="/bindings/:uuid" element={<MainLayout><PageBinding /></MainLayout>} />
                    <Route path="/bindings/search-replace" element={<MainLayout><PageSearchReplace /></MainLayout>} />
                    <Route path="/settings/organization" element={<MainLayout><PageOrganizationSettings /></MainLayout>} />
                    <Route path="/settings/organization/:organizationId" element={<MainLayout><PageOrganizationSettings /></MainLayout>} />
                    <Route path="/settings/location-change" element={<MainLayout><PageLocationChange /></MainLayout>} />
                  </Route>

                  <Route element={<PrivateRoute />}>
                    <Route path="/notifications" element={<MainLayout><PageNotification /></MainLayout>} />
                  </Route>

                  <Route path="/unauthorized" element={<PageError401 />} />
                  <Route path="/forbidden" element={<PageError403 />} />
                  <Route path="*" element={<PageError404 />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ProviderOrganizationUiSettings>
        </ProviderTheme>
      </ProviderI18n>
    </QueryClientProvider>
  </Provider>
);

export default App;