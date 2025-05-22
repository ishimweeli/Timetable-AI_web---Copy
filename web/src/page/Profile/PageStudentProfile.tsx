import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Building,
  Map,
  Award,
  BookOpen,
  Calendar,
  GraduationCap,
  FileText,
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
import { useGetStudentByUuidQuery, useGetStudentsQuery } from "@/store/Student/ApiStudent";
import { Spinner } from "@/component/Ui/spinner";

const PageStudentProfile = () => {
  // Using i18n for translations
  const { t } = useI18n();
  // Toast is used for notifications if needed
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  // First, get all students to find the one that matches the current user
  const { data: studentsResponse, isLoading: isLoadingStudents } = useGetStudentsQuery({
    // Add organization filter if available
    orgId: user?.organizationId ? Number(user.organizationId) : undefined
  });

  // Find the student that matches the current user's email
  const studentMatch = studentsResponse?.data?.find(student => student.email === user?.email);

  // Log for debugging
  console.log('Current user:', user);
  console.log('All students:', studentsResponse?.data);
  console.log('Matched student:', studentMatch);

  // Get the student UUID from the matched student
  const studentUuid = studentMatch?.uuid;

  // Show a toast notification if no matching student is found
  useEffect(() => {
    if(!isLoadingStudents && studentsResponse?.data && !studentMatch) {
      toast({
        variant: "destructive",
        title: "Student Profile Not Found",
        description: "Could not find a student profile matching your user account."
      });
    }
  }, [isLoadingStudents, studentsResponse, studentMatch, toast]);

  // Fetch detailed student data using the student UUID
  const { data: studentResponse, isLoading: isLoadingStudent, error } = useGetStudentByUuidQuery(
    studentUuid || "",
    {
      skip: !studentUuid,
    }
  );

  // Combined loading state
  const isLoading = isLoadingStudents || isLoadingStudent;

  const student = studentResponse?.data;

  const getGradeText = (classId: number): string => {
    switch (classId) {
      case 1:
        return "Freshman";
      case 2:
        return "Sophomore";
      case 3:
        return "Junior";
      case 4:
        return "Senior";
      case 5:
        return "Graduate";
      default:
        return "Unknown";
    }
  };

  const getStatusText = (statusId: number): string => {
    switch (statusId) {
      case 1:
        return "Active";
      case 2:
        return "Probation";
      case 3:
        return "Academic Warning";
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
        return "secondary"; // Probation
      case 3:
        return "destructive"; // Academic Warning
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
              <span className="ml-2">{t('common.loading')}</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if(error || !student) {
    return (
      <div className="flex h-screen bg-background-main">
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <div className="container mx-auto max-w-5xl">
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <h2 className="text-lg font-semibold text-red-800 mb-2">
                  {t('profile.error.title')}
                </h2>
                <p className="text-red-700">
                  {t('profile.error.message')}
                </p>
                {/* Display error message if available */}
                {error && (
                  <p className="text-xs text-red-600 mt-2">
                    {toast({
                      variant: "destructive",
                      title: "Error",
                      description: error.toString(),
                    }) && null /* Use toast but don't render anything */}
                  </p>
                )}
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate("/student-dashboard")}
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
                <h1 className="text-2xl font-bold text-primary">{t('profile.student.title')}</h1>
                <p className="text-muted-foreground text-sm">{t('profile.student.subtitle')}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/student-dashboard")}
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
                      {student.fullName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center border-2 border-primary/20 shadow-sm">
                          <User className="h-14 w-14 text-primary/70" />
                        </div>
                        <Badge className="absolute -bottom-2 -right-2 px-3 py-1 bg-primary text-white font-medium shadow-sm">
                          {getGradeText(student.classId)}
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
                            {student.email || "No email provided"}
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
                            {student.phone || "No phone provided"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Student ID</p>
                          <span className="text-sm font-medium">{student.studentIdNumber}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Map className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Address</p>
                          <span className="text-sm font-medium">
                            {student.address || "No address provided"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      Academic Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium">Current Status</span>
                      <Badge variant={getStatusVariant(student.statusId)} className="px-3 py-1">
                        {getStatusText(student.statusId)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right column - Tabs */}
              <div className="md:w-2/3">
                <Tabs defaultValue="info" className="bg-white rounded-lg shadow-sm p-1">
                  <TabsList className="grid w-full grid-cols-3 mb-2">
                    <TabsTrigger value="info" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                      <FileText className="h-4 w-4 mr-2" />
                      Information
                    </TabsTrigger>
                    <TabsTrigger value="academic" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Academic
                    </TabsTrigger>
                    <TabsTrigger value="timetable" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                      <Calendar className="h-4 w-4 mr-2" />
                      Timetable
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-4 pt-4">
                    <Card className="border-none shadow-none">
                      <CardHeader className="pb-0">
                        <CardTitle className="text-base flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          Student Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">
                              Department
                            </div>
                            <div className="font-medium flex items-center">
                              <Building className="h-4 w-4 mr-2 text-primary" />
                              {student.department || "Not specified"}
                            </div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">
                              Organization ID
                            </div>
                            <div className="font-medium flex items-center">
                              <Building className="h-4 w-4 mr-2 text-primary" />
                              {student.organizationId}
                            </div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">
                              Class
                            </div>
                            <div className="font-medium flex items-center">
                              <GraduationCap className="h-4 w-4 mr-2 text-primary" />
                              {getGradeText(student.classId)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Notes section removed as it's not available in the Student type */}
                  </TabsContent>

                  <TabsContent value="academic" className="space-y-4 pt-4">
                    <Card className="border-none shadow-none">
                      <CardHeader className="pb-0">
                        <CardTitle className="text-base flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          Academic Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="bg-slate-50 p-6 rounded-lg text-center border border-dashed border-slate-300">
                          <BookOpen className="h-12 w-12 text-primary/30 mx-auto mb-3" />
                          <p className="text-muted-foreground mb-2">
                            Academic information will be available soon.
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Check back later for your grades, courses, and academic progress.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="timetable" className="space-y-4 pt-4">
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

export default PageStudentProfile;
