import React, { useState } from "react";
import {
  GraduationCap,
  Calendar,
  Clock,
  Grid,
  Bell,
  Construction,
  Map,
  Search,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/component/Ui/card";
import { Button } from "@/component/Ui/button";

const IndexStudentPage = () => {
  return (
    <div className="flex h-screen bg-background-main">
      <div className="flex-1 flex flex-col">

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center mb-6">
              <GraduationCap className="h-6 w-6 mr-2 text-primary" />
              <h1 className="text-3xl font-bold">Student Timetable</h1>
            </div>

            <div className="flex justify-center items-center gap-2 text-purple-600 mb-6 bg-purple-50 p-4 rounded-md border border-purple-100">
              <Construction className="h-5 w-5" />
              <p className="text-lg font-medium">Coming Soon</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <div className="rounded-full bg-purple-100 w-8 h-8 flex items-center justify-center mr-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                    Weekly Class Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    View your personalized class timetable with subject and time
                    details.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-indigo-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <div className="rounded-full bg-indigo-100 w-8 h-8 flex items-center justify-center mr-2">
                      <Map className="h-4 w-4 text-indigo-600" />
                    </div>
                    Classroom Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    See which rooms your classes are scheduled in across campus.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <div className="rounded-full bg-blue-100 w-8 h-8 flex items-center justify-center mr-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    Class Timings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Check your class start and end times with automated
                    reminders.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-teal-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <div className="rounded-full bg-teal-100 w-8 h-8 flex items-center justify-center mr-2">
                      <AlertTriangle className="h-4 w-4 text-teal-600" />
                    </div>
                    Schedule Conflicts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Get notified of any conflicts in your class schedule
                    automatically.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-main">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <div className="rounded-full bg-amber-100 w-8 h-8 flex items-center justify-center mr-2">
                      <Grid className="h-4 w-4 text-amber-600" />
                    </div>
                    Schedule View Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    View your timetable by day, week, or month with customized
                    filters.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-pink-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center">
                    <div className="rounded-full bg-pink-100 w-8 h-8 flex items-center justify-center mr-2">
                      <Search className="h-4 w-4 text-pink-600" />
                    </div>
                    Free Period Finder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Find available free periods in your schedule for study or
                    activities.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <h2 className="text-xl font-bold text-purple-800 mb-3 text-center">
                Student Timetable Coming Soon
              </h2>
              <p className="text-purple-700 mb-4 text-center">
                Your AI-optimized class schedule with smart room allocation is
                being developed for the upcoming semester.
              </p>
              <div className="flex justify-center">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
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

export default IndexStudentPage;
