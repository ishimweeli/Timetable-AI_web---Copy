import React, { useState } from "react";
import {
  School,
  Calendar,
  Clock,
  Users,
  Grid,
  Bell,
  Construction,
  Sliders,
  ArrowLeftRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/component/Ui/card";
import { Button } from "@/component/Ui/button";

const IndexTeacherPage = () => {
  return (
    <div className="flex h-screen bg-background-main">
      <div className="flex-1 flex flex-col">

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center mb-6">
              <School className="h-6 w-6 mr-2 text-primary" />
              <h1 className="text-3xl font-bold">Teacher Timetable</h1>
            </div>

            <div className="flex justify-center items-center gap-2 text-blue-600 mb-6 bg-blue-50 p-4 rounded-md border border-blue-100">
              <Construction className="h-5 w-5" />
              <p className="text-lg font-medium">Coming Soon</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <div className="rounded-full bg-blue-100 w-8 h-8 flex items-center justify-center mr-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    Weekly Timetable
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    View your teaching schedule with class times, rooms, and
                    subjects.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-indigo-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <div className="rounded-full bg-indigo-100 w-8 h-8 flex items-center justify-center mr-2">
                      <Clock className="h-4 w-4 text-indigo-600" />
                    </div>
                    Time Slot Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Set your preferred teaching hours and break times.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <div className="rounded-full bg-purple-100 w-8 h-8 flex items-center justify-center mr-2">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    Class Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    See which classes and student groups are assigned to you.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-teal-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <div className="rounded-full bg-teal-100 w-8 h-8 flex items-center justify-center mr-2">
                      <Grid className="h-4 w-4 text-teal-600" />
                    </div>
                    Room Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Check which classrooms are allocated for your classes.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-main">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <div className="rounded-full bg-amber-100 w-8 h-8 flex items-center justify-center mr-2">
                      <Sliders className="h-4 w-4 text-amber-600" />
                    </div>
                    Schedule Conflicts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Get alerts for any scheduling conflicts or overlaps.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <div className="rounded-full bg-red-100 w-8 h-8 flex items-center justify-center mr-2">
                      <ArrowLeftRight className="h-4 w-4 text-red-600" />
                    </div>
                    Schedule Changes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Request changes to your timetable when needed.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h2 className="text-xl font-bold text-blue-800 mb-3 text-center">
                Teacher Timetable Coming Soon
              </h2>
              <p className="text-blue-700 mb-4 text-center">
                Your personalized teaching schedule with AI-optimized time slots
                is currently being developed.
              </p>
              <div className="flex justify-center">
                <Button className="text-white">
                  Get Notified When It's Ready
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IndexTeacherPage;
