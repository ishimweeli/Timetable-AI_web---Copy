import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/hook/useAppRedux";


const HOME_ROUTES = {
  STUDENT: "/student-dashboard",
  TEACHER: "/teacher-dashboard",
  MANAGER: "/dashboard",
  ADMIN: "/dashboard"
};


const ALLOWED_PATHS = {

  STUDENT: ["/timetable", "/student-profile", "/student-dashboard", "/manual-scheduling"],


  TEACHER: ["/timetable", "/teacher-profile", "/teacher-dashboard", "/manual-scheduling"],


  MANAGER: [
    "/dashboard",
    "/timetable",
    "/timetable/settings",
    "/manual-scheduling",
    "/plansetting",
    "/plansetting/new",
    "/plansetting/edit",
    "/teachers",
    "/classes",
    "/rooms",
    "/subjects",
    "/students",
    "/rules",
    "/periods",
    "/classband",
    "/organizations",
    "/managers",
    "/bindings",
    "/calendar",
    "/settings/organization"
  ],


  ADMIN: []
};

interface PrivateRouteProps {
  allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();



  if(!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if(allowedRoles && !allowedRoles.includes(user?.roleName || "")) {
    return <Navigate to="/dashboard" replace />;
  }

  const userRole = user?.roleName || "";
  const homeRoute = HOME_ROUTES[userRole as keyof typeof HOME_ROUTES] || "/unauthorized";


  if(location.pathname === "/" || location.pathname === "/dashboard") {
    if(userRole === "STUDENT") {
      return <Navigate to="/student-dashboard" replace />;
    }

    else if(userRole === "TEACHER") {
      return <Navigate to="/teacher-dashboard" replace />;
    }
    else if((userRole === "MANAGER" || userRole === "ADMIN") && location.pathname === "/") {
      return <Navigate to="/dashboard" replace />;
    }

    else if(userRole !== "MANAGER" && userRole !== "ADMIN") {
      return <Navigate to={homeRoute} replace />;
    }
  }


  if(userRole && userRole !== "ADMIN") {
    const allowedRolePaths = ALLOWED_PATHS[userRole as keyof typeof ALLOWED_PATHS] || [];


    const isAllowedPath = allowedRolePaths.some(path =>
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );

    if(!isAllowedPath) {

      if(userRole === "STUDENT") {
        return <Navigate to="/student-dashboard" replace />;
      } else if(userRole === "TEACHER") {
        return <Navigate to="/teacher-dashboard" replace />;
      }else {
        return <Navigate to={homeRoute} replace />;
      }
    }
  }


  return <Outlet />;
};

export default PrivateRoute;
