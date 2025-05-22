import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/component/Ui/tabs.tsx";
import StudentDirectory from "./StudentDirectory";
import StudentDashboard from "./StudentDashboard";
import { UserIcon, LayoutDashboard } from "lucide-react";

const StudentManagement = () => {
  const [activeTab, setActiveTab] = useState("directory");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <UserIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Student Management</h1>
      </div>

      <Tabs
        defaultValue="directory"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>
        <TabsContent value="directory">
          <StudentDirectory />
        </TabsContent>
        <TabsContent value="dashboard">
          <StudentDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentManagement;
