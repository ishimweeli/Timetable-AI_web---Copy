import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/component/Ui/card.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/component/Ui/tabs.tsx";
import { Progress } from "@/component/Ui/progress.tsx";
import { Calendar } from "@/component/Ui/calendar.tsx";
import { getStudents } from "@/services/student/StudentService";
import { Student } from "@/type/student/student";
import {
  Loader2,
  BookOpen,
  Clock,
  UserCheck,
  Award,
  Calendar as CalendarIcon,
} from "lucide-react";

const StudentDashboard = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await getStudents(0, 10);
        if(response && response.data) {
          setStudents(response.data);
        }
      }catch(error) {
        console.error("Error fetching students for dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if(isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Overview Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Student Overview</CardTitle>
            <CardDescription>
              List of all students with their details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.map((student) => (
                <div
                  key={student.uuid}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-lg">{student.fullName}</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-500">
                    <div>
                      <p className="font-semibold">ID:</p>
                      <p>{student.studentIdNumber}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Department:</p>
                      <p>{student.department || "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Email:</p>
                      <p className="truncate">{student.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Phone:</p>
                      <p>{student.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Status:</p>
                      <p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            student.statusId === 1
                              ? "bg-green-100 text-green-800"
                              : student.statusId === 2
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {student.statusId === 1
                            ? "Active"
                            : student.statusId === 2
                              ? "Pending"
                              : "Inactive"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
