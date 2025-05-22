import React, { useState } from "react";
import Header from "@/component/Core/layout/Header";
import Sidebar from "@/component/Core/layout/Sidebar";
import {
  ChartBar,
  Users,
  Building2,
  Database,
  Shield,
  Bell,
  List,
  LineChart,
  CircleAlert,
  Calendar,
  CheckCircle,
  XCircle,
  Headphones,
  Ticket,
  FileText,
  Activity,
  ServerCrash,
  Search,
  Clock,
  Filter,
  UserPlus,
  Home,
  BookOpen,
  BarChart3,
  PieChart,
  UserCog,
  Gauge,
  School,
  LayoutDashboard,
  Sliders,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/component/Ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/component/Ui/tabs";
import { Button } from "@/component/Ui/button";
import { Input } from "@/component/Ui/input";
import { Badge } from "@/component/Ui/badge";
import { Progress } from "@/component/Ui/progress";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/component/Ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/component/Ui/form";
import { useForm } from "react-hook-form";
import { Separator } from "@/component/Ui/separator";
import { useI18n } from "@/hook/useI18n";

// Mock data for demonstration
const mockOrganizations = [
  {
    id: 1,
    name: "Springfield High School",
    status: "active",
    users: 120,
    lastActive: "2 hours ago",
  },
  {
    id: 2,
    name: "Lincoln Academy",
    status: "active",
    users: 87,
    lastActive: "1 day ago",
  },
  {
    id: 3,
    name: "Washington University",
    status: "inactive",
    users: 0,
    lastActive: "3 months ago",
  },
  {
    id: 4,
    name: "Jefferson School District",
    status: "active",
    users: 245,
    lastActive: "5 hours ago",
  },
  {
    id: 5,
    name: "Roosevelt College",
    status: "active",
    users: 156,
    lastActive: "3 hours ago",
  },
  {
    id: 6,
    name: "Kennedy High",
    status: "active",
    users: 98,
    lastActive: "12 hours ago",
  },
];

const mockAdmins = [
  {
    id: 1,
    name: "John Smith",
    organization: "Springfield High School",
    role: "Admin",
    status: "active",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    organization: "Lincoln Academy",
    role: "Super Admin",
    status: "active",
  },
  {
    id: 3,
    name: "David Williams",
    organization: "Washington University",
    role: "Admin",
    status: "inactive",
  },
  {
    id: 4,
    name: "Emily Brown",
    organization: "Jefferson School District",
    role: "Manager",
    status: "active",
  },
  {
    id: 5,
    name: "Michael Davis",
    organization: "Roosevelt College",
    role: "Admin",
    status: "active",
  },
];

const mockAuditLogs = [
  {
    id: 1,
    user: "John Smith",
    action: "Created new account",
    timestamp: "2 hours ago",
    details: "Teacher account for Lisa Reynolds",
  },
  {
    id: 2,
    user: "System",
    action: "Scheduled backup",
    timestamp: "6 hours ago",
    details: "Weekly backup completed successfully",
  },
  {
    id: 3,
    user: "Sarah Johnson",
    action: "Modified permissions",
    timestamp: "1 day ago",
    details: "Updated role permissions for Admin group",
  },
  {
    id: 4,
    user: "Emily Brown",
    action: "Generated timetable",
    timestamp: "1 day ago",
    details: "Spring semester for Jefferson High",
  },
  {
    id: 5,
    user: "Michael Davis",
    action: "Reset password",
    timestamp: "2 days ago",
    details: "For user account ID #1423",
  },
];

const mockSupportTickets = [
  {
    id: 1,
    title: "Unable to generate timetable",
    status: "open",
    priority: "high",
    submitted: "3 hours ago",
  },
  {
    id: 2,
    title: "Password reset issue",
    status: "in progress",
    priority: "medium",
    submitted: "1 day ago",
  },
  {
    id: 3,
    title: "API integration question",
    status: "resolved",
    priority: "low",
    submitted: "2 days ago",
  },
  {
    id: 4,
    title: "Room conflict in schedule",
    status: "open",
    priority: "high",
    submitted: "5 hours ago",
  },
  {
    id: 5,
    title: "Export to PDF not working",
    status: "in progress",
    priority: "medium",
    submitted: "1 day ago",
  },
];

const Index = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeModule, setActiveModule] = useState("overview");
  const form = useForm();

  const handleSubmit = (data) => {
    console.log("Form submitted:", data);
    // In a real application, this would create a new organization
  };

  return (
    <div className="flex flex-col min-h-screen istui-timetable__dashboard_page">
      <Header />

      <div className="flex flex-1 istui-timetable__dashboard_main">
        <Sidebar className="shrink-0 istui-timetable__sidebar" />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 istui-timetable__dashboard_container">
          <div className="container-main mx-auto istui-timetable__dashboard_content">
            <div className="flex items-center mb-6 istui-timetable__dashboard_header">
              <LayoutDashboard className="h-6 w-6 mr-2 text-primary" />
              <h1 className="text-3xl font-bold istui-timetable__dashboard_title">
                Dashboard
              </h1>
            </div>

            <Tabs
              defaultValue="dashboard"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full istui-timetable__dashboard_tabs"
            >
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 istui-timetable__dashboard_tabs_list">
                <TabsTrigger
                  value="dashboard"
                  className="flex items-center gap-2 istui-timetable__dashboard_tab_trigger"
                >
                  <Home className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="organizations"
                  className="flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Organizations
                </TabsTrigger>
                <TabsTrigger value="admins" className="flex items-center gap-2">
                  <UserCog className="h-4 w-4" />
                  Admins
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  System
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent
                value="dashboard"
                className="mt-0 space-y-6 istui-timetable__dashboard_tab_content"
              >
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 istui-timetable__dashboard_stats_grid">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 istui-timetable__dashboard_card istui-timetable__dashboard_stats_card">
                    <CardHeader className="p-4 pb-2 istui-timetable__dashboard_card_header">
                      <CardTitle className="text-base font-medium flex justify-between items-center istui-timetable__dashboard_card_title">
                        Total Organizations
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 istui-timetable__dashboard_card_content">
                      <div className="text-3xl font-bold text-blue-800">42</div>
                      <p className="text-xs text-blue-600">
                        +3 from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base font-medium flex justify-between items-center">
                        Active Users
                        <Users className="h-4 w-4 text-purple-600" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-3xl font-bold text-purple-800">
                        1,248
                      </div>
                      <p className="text-xs text-purple-600">+22% increase</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-main">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base font-medium flex justify-between items-center">
                        Timetables Generated
                        <Calendar className="h-4 w-4 text-amber-600" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-3xl font-bold text-amber-800">
                        578
                      </div>
                      <p className="text-xs text-amber-600">Last 30 days</p>
                      <div className="mt-2">
                        <Button
                          variant="link"
                          className="p-0 h-auto text-amber-600 hover:text-amber-700"
                          asChild
                        >
                          <a href="/plansetting">Plan Settings</a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base font-medium flex justify-between items-center">
                        System Health
                        <Activity className="h-4 w-4 text-green-600" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center gap-2">
                        <div className="text-3xl font-bold text-green-800">
                          98.7%
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 h-6 border-green-300"
                        >
                          Healthy
                        </Badge>
                      </div>
                      <p className="text-xs text-green-600">
                        All systems operational
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 istui-timetable__dashboard_charts_grid">
                  {/* User Distribution */}
                  <Card className="lg:col-span-1 border-violet-200 istui-timetable__dashboard_card istui-timetable__dashboard_chart_card">
                    <CardHeader className="p-4 pb-2 border-b">
                      <CardTitle className="text-base font-medium flex items-center">
                        <PieChart className="h-4 w-4 mr-2 text-violet-600" />
                        Users by Role
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Admins</span>
                            <span className="font-semibold">64</span>
                          </div>
                          <Progress
                            value={12}
                            className="h-2 bg-violet-100"
                            indicatorColor="bg-progress"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Managers</span>
                            <span className="font-semibold">128</span>
                          </div>
                          <Progress
                            value={24}
                            className="h-2 bg-violet-100"
                            indicatorColor="bg-progress"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Teachers</span>
                            <span className="font-semibold">384</span>
                          </div>
                          <Progress
                            value={72}
                            className="h-2 bg-violet-100"
                            indicatorColor="bg-progress"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Students</span>
                            <span className="font-semibold">672</span>
                          </div>
                          <Progress
                            value={100}
                            className="h-2 bg-violet-100"
                            indicatorColor="bg-progress"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* System Usage */}
                  <Card className="lg:col-span-2 border-sky-200 istui-timetable__dashboard_card istui-timetable__dashboard_chart_card">
                    <CardHeader className="p-4 pb-2 border-b">
                      <CardTitle className="text-base font-medium flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2 text-sky-600" />
                        System Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="h-60 flex items-center justify-center border-2 border-dashed rounded-md border-sky-200">
                        <div className="text-center">
                          <LineChart className="h-10 w-10 mx-auto text-sky-500" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            API calls and system usage graph
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 istui-timetable__dashboard_tables_grid">
                  {/* Timetable Generation Stats */}
                  <Card className="border-main istui-timetable__dashboard_card istui-timetable__dashboard_table_card">
                    <CardHeader className="p-4 pb-2 border-b">
                      <CardTitle className="text-base font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-amber-600" />
                        Timetable Generation Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Success Rate</span>
                          </div>
                          <span className="font-semibold">92%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span>Failure Rate</span>
                          </div>
                          <span className="font-semibold">8%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>Avg. Generation Time</span>
                          </div>
                          <span className="font-semibold">2.4 mins</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-500" />
                            <span>Schedules Generated Today</span>
                          </div>
                          <span className="font-semibold">17</span>
                        </div>

                        <div className="pt-2 mt-2 border-t border-gray-100">
                          <Button
                            className="w-full bg-primary bg-primary--hover text-white flex items-center justify-center gap-2"
                            asChild
                          >
                            <a href="/plansetting">
                              <Sliders className="h-4 w-4" />
                              <span>Manage Plan Settings</span>
                            </a>
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">
                            Configure timetable parameters, time blocks, and
                            constraints
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card className="border-emerald-200 istui-timetable__dashboard_card istui-timetable__dashboard_table_card">
                    <CardHeader className="p-4 pb-2 border-b">
                      <CardTitle className="text-base font-medium flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-emerald-600" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {mockAuditLogs.slice(0, 3).map((log) => (
                          <div
                            key={log.id}
                            className="border-b pb-2 last:border-0 border-gray-100"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">
                                  {log.action}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  By {log.user}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {log.timestamp}
                              </span>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full">
                          View All Activity
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Organizations Tab */}
              <TabsContent value="organizations" className="mt-0 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div className="flex items-center space-x-2 w-full max-w-sm">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search organizations..."
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full md:w-auto text-white">
                        <Building2 className="mr-2 h-4 w-4" />
                        Add Organization
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Organization</DialogTitle>
                        <DialogDescription>
                          Create a new organization in the system.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(handleSubmit)}
                          className="space-y-4"
                        >
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Organization Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter organization name"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="domain"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Domain</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="organization.edu"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline">
                              Cancel
                            </Button>
                            <Button type="submit">Create Organization</Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-3 font-medium">
                              Organization
                            </th>
                            <th className="text-left p-3 font-medium">
                              Status
                            </th>
                            <th className="text-left p-3 font-medium">Users</th>
                            <th className="text-left p-3 font-medium">
                              Last Active
                            </th>
                            <th className="text-right p-3 font-medium">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockOrganizations.map((org) => (
                            <tr
                              key={org.id}
                              className="border-b hover:bg-muted/50"
                            >
                              <td className="p-3 flex items-center">
                                <School className="h-4 w-4 mr-2 text-primary" />
                                {org.name}
                              </td>
                              <td className="p-3">
                                <Badge
                                  variant={
                                    org.status === "active"
                                      ? "default"
                                      : "outline"
                                  }
                                  className={
                                    org.status === "active"
                                      ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-300"
                                      : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                  }
                                >
                                  {org.status === "active"
                                    ? "Active"
                                    : "Inactive"}
                                </Badge>
                              </td>
                              <td className="p-3">{org.users}</td>
                              <td className="p-3">{org.lastActive}</td>
                              <td className="p-3 text-right">
                                <Button variant="ghost" size="sm">
                                  Edit
                                </Button>
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Admins Tab */}
              <TabsContent value="admins" className="mt-0 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div className="flex items-center space-x-2 w-full max-w-sm">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search admins..."
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Admin
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Admin</DialogTitle>
                        <DialogDescription>
                          Create a new admin account with specific role
                          permissions.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(handleSubmit)}
                          className="space-y-4"
                        >
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter full name"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="email@example.com"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline">
                              Cancel
                            </Button>
                            <Button type="submit">Create Admin</Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-3 font-medium">Name</th>
                            <th className="text-left p-3 font-medium">
                              Organization
                            </th>
                            <th className="text-left p-3 font-medium">Role</th>
                            <th className="text-left p-3 font-medium">
                              Status
                            </th>
                            <th className="text-right p-3 font-medium">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockAdmins.map((admin) => (
                            <tr
                              key={admin.id}
                              className="border-b hover:bg-muted/50"
                            >
                              <td className="p-3 flex items-center">
                                <UserCog className="h-4 w-4 mr-2 text-primary" />
                                {admin.name}
                              </td>
                              <td className="p-3">{admin.organization}</td>
                              <td className="p-3">
                                <Badge
                                  variant="outline"
                                  className={
                                    admin.role === "Super Admin"
                                      ? "bg-purple-100 text-purple-800 border-purple-300"
                                      : admin.role === "Admin"
                                        ? "bg-blue-100 text-blue-800 border-blue-300"
                                        : "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  }
                                >
                                  {admin.role}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <Badge
                                  variant={
                                    admin.status === "active"
                                      ? "default"
                                      : "outline"
                                  }
                                  className={
                                    admin.status === "active"
                                      ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-300"
                                      : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                  }
                                >
                                  {admin.status === "active"
                                    ? "Active"
                                    : "Inactive"}
                                </Badge>
                              </td>
                              <td className="p-3 text-right">
                                <Button variant="ghost" size="sm">
                                  Edit
                                </Button>
                                <Button variant="ghost" size="sm">
                                  Reset Password
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* System Tab */}
              <TabsContent value="system" className="mt-0">
                <Tabs
                  defaultValue="monitoring"
                  value={activeModule}
                  onValueChange={setActiveModule}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
                    <TabsTrigger
                      value="monitoring"
                      className="flex items-center gap-2"
                    >
                      <Gauge className="h-4 w-4" />
                      Monitoring
                    </TabsTrigger>
                    <TabsTrigger
                      value="notifications"
                      className="flex items-center gap-2"
                    >
                      <Bell className="h-4 w-4" />
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger
                      value="audit"
                      className="flex items-center gap-2"
                    >
                      <List className="h-4 w-4" />
                      Audit Logs
                    </TabsTrigger>
                    <TabsTrigger
                      value="support"
                      className="flex items-center gap-2"
                    >
                      <Headphones className="h-4 w-4" />
                      Support
                    </TabsTrigger>
                  </TabsList>

                  {/* Monitoring Tab */}
                  <TabsContent value="monitoring" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-emerald-200">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-base font-medium flex items-center">
                            <Gauge className="h-4 w-4 mr-2 text-emerald-600" />
                            System Health
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <ServerCrash className="h-4 w-4 text-green-500" />
                                <span>Server Load</span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-semibold">28%</span>
                                <Progress
                                  value={28}
                                  className="w-20 h-2 ml-2 bg-green-100"
                                  indicatorColor="bg-green-500"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Database className="h-4 w-4 text-green-500" />
                                <span>Database</span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-semibold">42%</span>
                                <Progress
                                  value={42}
                                  className="w-20 h-2 ml-2 bg-green-100"
                                  indicatorColor="bg-green-500"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-green-500" />
                                <span>API Response Time</span>
                              </div>
                              <span className="font-semibold">127ms</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <CircleAlert className="h-4 w-4 text-yellow-500" />
                                <span>Error Rate</span>
                              </div>
                              <span className="font-semibold">0.08%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-blue-200">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-base font-medium flex items-center">
                            <BarChart3 className="h-4 w-4 mr-2 text-blue-600" />
                            Performance Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="h-60 flex items-center justify-center border-2 border-dashed rounded-md border-blue-200">
                            <div className="text-center">
                              <ChartBar className="h-10 w-10 mx-auto text-blue-400" />
                              <p className="mt-2 text-sm text-muted-foreground">
                                System performance metrics
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Notifications Tab */}
                  <TabsContent value="notifications" className="mt-0 space-y-6">
                    <Card className="border-main">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-base font-medium flex items-center">
                          <Bell className="h-4 w-4 mr-2 text-amber-600" />
                          System Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Bell className="h-4 w-4 text-blue-500" />
                              <span>Maintenance Alert Template</span>
                            </div>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Bell className="h-4 w-4 text-green-500" />
                              <span>New Feature Announcement</span>
                            </div>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Bell className="h-4 w-4 text-yellow-500" />
                              <span>System Update Reminder</span>
                            </div>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                          <Separator />
                          <Button className="w-full bg-primary bg-primary--hover text-white">
                            <Bell className="mr-2 h-4 w-4" />
                            Send Broadcast Message
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Audit Logs Tab */}
                  <TabsContent value="audit" className="mt-0 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                      <div className="flex items-center space-x-2 w-full max-w-sm">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder="Search audit logs..."
                            className="pl-8"
                          />
                        </div>
                      </div>
                      <Button variant="outline" className="w-full md:w-auto">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </div>

                    <Card className="border-violet-200">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-base font-medium flex items-center">
                          <List className="h-4 w-4 mr-2 text-violet-600" />
                          System Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted">
                              <tr>
                                <th className="text-left p-3 font-medium">
                                  User
                                </th>
                                <th className="text-left p-3 font-medium">
                                  Action
                                </th>
                                <th className="text-left p-3 font-medium">
                                  Details
                                </th>
                                <th className="text-right p-3 font-medium">
                                  Timestamp
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {mockAuditLogs.map((log) => (
                                <tr
                                  key={log.id}
                                  className="border-b hover:bg-muted/50"
                                >
                                  <td className="p-3">{log.user}</td>
                                  <td className="p-3">{log.action}</td>
                                  <td className="p-3">{log.details}</td>
                                  <td className="p-3 text-right">
                                    {log.timestamp}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Support Tab */}
                  <TabsContent value="support" className="mt-0 space-y-6">
                    <Card className="border-emerald-200">
                      <CardHeader className="p-4 pb-2 border-b">
                        <CardTitle className="text-base font-medium flex items-center">
                          <Ticket className="h-4 w-4 mr-2 text-emerald-600" />
                          Support Tickets
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted">
                              <tr>
                                <th className="text-left p-3 font-medium">
                                  Ticket
                                </th>
                                <th className="text-left p-3 font-medium">
                                  Status
                                </th>
                                <th className="text-left p-3 font-medium">
                                  Priority
                                </th>
                                <th className="text-left p-3 font-medium">
                                  Submitted
                                </th>
                                <th className="text-right p-3 font-medium">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {mockSupportTickets.map((ticket) => (
                                <tr
                                  key={ticket.id}
                                  className="border-b hover:bg-muted/50"
                                >
                                  <td className="p-3">{ticket.title}</td>
                                  <td className="p-3">
                                    <Badge
                                      variant="outline"
                                      className={
                                        ticket.status === "open"
                                          ? "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-300"
                                          : ticket.status === "in progress"
                                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-300"
                                            : "bg-green-100 text-green-800 hover:bg-green-100 border-green-300"
                                      }
                                    >
                                      {ticket.status}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <Badge
                                      variant="outline"
                                      className={
                                        ticket.priority === "high"
                                          ? "bg-red-100 text-red-800 hover:bg-red-100 border-red-300"
                                          : ticket.priority === "medium"
                                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-300"
                                            : "bg-green-100 text-green-800 hover:bg-green-100 border-green-300"
                                      }
                                    >
                                      {ticket.priority}
                                    </Badge>
                                  </td>
                                  <td className="p-3">{ticket.submitted}</td>
                                  <td className="p-3 text-right">
                                    <Button variant="ghost" size="sm">
                                      View
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      Respond
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-blue-200">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-base font-medium flex items-center">
                            <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                            Documentation
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <span>System Administration Guide</span>
                              </div>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <span>API Documentation</span>
                              </div>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <span>User Management</span>
                              </div>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-purple-200">
                        <CardHeader className="p-4 pb-2 border-b">
                          <CardTitle className="text-base font-medium flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-purple-600" />
                            FAQ Management
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span>Timetable Generation FAQs</span>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Account Management FAQs</span>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>System Requirements FAQs</span>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </div>
                            <Separator />
                            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                              <FileText className="mr-2 h-4 w-4" />
                              Create New FAQ
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
