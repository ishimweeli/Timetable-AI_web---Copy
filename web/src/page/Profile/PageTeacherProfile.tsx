import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Building,
  BookOpen,
  Award,
  Clock,
  Calendar,
  FileText,
  Briefcase,
  Edit,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/component/Ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/component/Ui/tabs";
import { Badge } from "@/component/Ui/badge";
import { Button } from "@/component/Ui/button";
import { useToast } from "@/hook/useToast";
import { useAppSelector } from "@/hook/useAppRedux";
import { useI18n } from "@/hook/useI18n";
import { useGetTeacherQuery } from "@/store/Teacher/ApiTeacher";
import { Spinner } from "@/component/Ui/spinner";

const PageTeacherProfile = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  
  // Get the current user's UUID
  const userUuid = user?.uuid;
  
  // Fetch teacher data
  const { data: teacherResponse, isLoading, error } = useGetTeacherQuery(userUuid || "", {
    skip: !userUuid,
  });
  
  const teacher = teacherResponse?.data;

  const getStatusText = (statusId: number): string => {
    switch (statusId) {
      case 1:
        return "Active";
      case 2:
        return "On Leave";
      case 3:
        return "Inactive";
      default:
        return "Unknown";
    }
  };

  const getStatusVariant = (
    statusId: number
  ): "default" | "outline" | "secondary" | "destructive" => {
    switch (statusId) {
      case 1:
        return "default"; // Active
      case 2:
        return "secondary"; // On Leave
      case 3:
        return "destructive"; // Inactive
      default:
        return "outline";
    }
  };

  if(isLoading) {
    return (
      <div className="flex h-screen bg-background-main">
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <div className="container mx-auto max-w-5xl flex items-center justify-center h-full">
              <Spinner size="lg" />
              <span className="ml-2">Loading profile...</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if(error || !teacher) {
    return (
      <div className="flex h-screen bg-background-main">
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <div className="container mx-auto max-w-5xl">
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <h2 className="text-lg font-semibold text-red-800 mb-2">
                  Error Loading Profile
                </h2>
                <p className="text-red-700">
                  There was a problem loading your profile information. Please try again later.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate("/teacher-dashboard")}
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background-main">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-4 bg-slate-50">
          <div className="container mx-auto max-w-6xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-primary">Teacher Profile</h1>
                <p className="text-muted-foreground text-sm">View and manage your professional information</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/teacher-dashboard")}
                className="flex items-center gap-1"
              >
                <span>Back to Dashboard</span>
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Left column - Basic info */}
              <div className="md:w-1/3 space-y-4">
                <Card className="border-t-4 border-t-primary shadow-sm hover:shadow transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-semibold text-primary">
                      {teacher.firstName} {teacher.lastName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center border-2 border-primary/20 shadow-sm">
                          <User className="h-14 w-14 text-primary/70" />
                        </div>
                        <Badge className="absolute -bottom-2 -right-2 px-3 py-1 bg-primary text-white font-medium shadow-sm">
                          Teacher
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <span className="text-sm font-medium">
                            {teacher.email || "No email provided"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <span className="text-sm font-medium">
                            {teacher.phone || "No phone provided"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Building className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Department</p>
                          <span className="text-sm font-medium">
                            {teacher.department || "No department specified"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Award className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Qualification</p>
                          <span className="text-sm font-medium">
                            {teacher.qualification || "No qualification specified"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm hover:shadow transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      Employment Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium">Current Status</span>
                      <Badge variant={getStatusVariant(teacher.statusId)} className="px-3 py-1">
                        {getStatusText(teacher.statusId)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right column - Tabs */}
              <div className="md:w-2/3">
                <Tabs defaultValue="info" className="bg-white rounded-lg shadow-sm p-1">
                  <TabsList className="grid w-full grid-cols-2 mb-2">
                    <TabsTrigger value="info" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                      <FileText className="h-4 w-4 mr-2" />
                      Information
                    </TabsTrigger>
                    <TabsTrigger value="schedule" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                      <Clock className="h-4 w-4 mr-2" />
                      Schedule Preferences
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-4 pt-4">
                    <Card className="border-none shadow-none">
                      <CardHeader className="pb-0">
                        <CardTitle className="text-base flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          Teacher Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">
                              Contract Type
                            </div>
                            <div className="font-medium flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-primary" />
                              {teacher.contractType || "Not specified"}
                            </div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">
                              Control Number
                            </div>
                            <div className="font-medium flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-primary" />
                              {teacher.controlNumber || "Not specified"}
                            </div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">
                              Initials
                            </div>
                            <div className="font-medium flex items-center">
                              <Edit className="h-4 w-4 mr-2 text-primary" />
                              {teacher.initials || "Not specified"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {teacher.bio && (
                      <Card className="border-none shadow-none">
                        <CardHeader className="pb-0">
                          <CardTitle className="text-base flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            Biography
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-primary/30">
                            <p className="text-sm">{teacher.bio}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {teacher.notes && (
                      <Card className="border-none shadow-none">
                        <CardHeader className="pb-0">
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Notes
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-primary/30">
                            <p className="text-sm italic">{teacher.notes}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="schedule" className="space-y-4 pt-4">
                    <Card className="border-none shadow-none">
                      <CardHeader className="pb-0">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          Schedule Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-slate-50 p-4 rounded-lg flex flex-col items-center justify-center">
                            <div className="bg-primary/10 p-3 rounded-full mb-2">
                              <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-xs text-muted-foreground text-center">
                              Max Daily Hours
                            </div>
                            <div className="font-medium text-lg text-center">
                              {teacher.maxDailyHours || "N/A"}
                            </div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-lg flex flex-col items-center justify-center">
                            <div className="bg-primary/10 p-3 rounded-full mb-2">
                              <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-xs text-muted-foreground text-center">
                              Preferred Start
                            </div>
                            <div className="font-medium text-lg text-center">
                              {teacher.preferredStartTime 
                                ? `${teacher.preferredStartTime.hour}:${teacher.preferredStartTime.minute.toString().padStart(2, '0')}` 
                                : "N/A"}
                            </div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-lg flex flex-col items-center justify-center">
                            <div className="bg-primary/10 p-3 rounded-full mb-2">
                              <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-xs text-muted-foreground text-center">
                              Preferred End
                            </div>
                            <div className="font-medium text-lg text-center">
                              {teacher.preferredEndTime 
                                ? `${teacher.preferredEndTime.hour}:${teacher.preferredEndTime.minute.toString().padStart(2, '0')}` 
                                : "N/A"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-none">
                      <CardHeader className="pb-0">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          Timetable
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="bg-slate-50 p-6 rounded-lg text-center border border-dashed border-slate-300">
                          <Calendar className="h-12 w-12 text-primary/30 mx-auto mb-3" />
                          <p className="text-muted-foreground mb-2">
                            Your personalized timetable will be available soon.
                          </p>
                          <Button 
                            variant="outline" 
                            className="mt-4 bg-white hover:bg-primary/5"
                            onClick={() => navigate("/timetable")}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            View Timetable
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageTeacherProfile;
