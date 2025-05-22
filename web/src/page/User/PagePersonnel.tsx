import React, { useState } from "react";
import { Search, Plus, ArrowUpDown, Filter, FileText } from "lucide-react";
import { Input } from "@/component/Ui/input.tsx";
import { Button } from "@/component/Ui/button.tsx";
import { Card } from "@/component/Ui/card.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/component/Ui/tabs.tsx";
import { Separator } from "@/component/Ui/separator.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/component/Ui/dropdown-menu.tsx";
import Header from "@/component/Core/layout/Header.tsx";
import Sidebar from "@/component/Core/layout/Sidebar.tsx";
import Breadcrumbs from "@/component/Core/navigation/Breadcrumbs.tsx";
import SchedulePreferencesTable from "@/component/Timetable/SchedulePreferencesTable.tsx";
import { useToast } from "@/hook/useToast.ts";
import { Progress } from "@/component/Ui/progress.tsx";
import { t } from "i18next";

const PagePersonnel = () => {
  const [selectedPersonnel, setSelectedPersonnel] = useState<string | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const isLoadingAny = false;

  const mockPersonnel = [
    {
      id: "1",
      initials: "JD",
      name: "John Doe",
      role: "Administrator",
      department: "Management",
    },
    {
      id: "2",
      initials: "JS",
      name: "Jane Smith",
      role: "Staff",
      department: "Administration",
    },
    {
      id: "3",
      initials: "RJ",
      name: "Robert Johnson",
      role: "Staff",
      department: "Support",
    },
    {
      id: "4",
      initials: "K",
      name: "Kevin White",
      role: "Administrator",
      department: "Management",
    },
  ];

  const filteredPersonnel = mockPersonnel.filter(
    (person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.initials.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSort = (key: string) => {
    toast({
      description: `Personnel sorted by ${key}`,
    });
  };

  return (
    <div className="flex h-screen bg-background-main">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-hidden istui-timetable__main_content">
          {isLoadingAny && (
            <div className="fixed top-0 left-0 w-full z-50">
              <Progress
                value={100}
                className="h-1"
                indicatorColor="animate-pulse bg-blue-500"
              />
            </div>
          )}
          <div className="container-main mx-auto py-4 px-4 sm:px-6 h-full flex flex-col istui-timetable__main_content">
            <div className="flex justify-between items-center mb-4 istui-timetable__main_breadcrumbs_wrapper">
              <Breadcrumbs
                className="istui-timetable__main_breadcrumbs"
                items={[
                  { label: t("navigation.resources"), href: "/resources" },
                  { label: t("navigation.personnel"), href: "" },
                ]}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[calc(100vh-220px)] overflow-y-auto">
              <div className="lg:col-span-5 xl:col-span-5 flex flex-col istui-timetable__main_list_card">
                <Card className="overflow-hidden">
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">
                          Personnel{" "}
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            ({filteredPersonnel.length})
                          </span>
                        </h2>
                        <div className="flex items-center gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 h-8"
                              >
                                <ArrowUpDown className="h-4 w-4" />
                                <span>Sort</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                              <DropdownMenuLabel>
                                Sort Personnel By
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleSort("name")}
                              >
                                Name (A-Z)
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleSort("name-desc")}
                              >
                                Name (Z-A)
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleSort("role")}
                              >
                                Role
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleSort("department")}
                              >
                                Department
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 h-8"
                              >
                                <Filter className="h-4 w-4" />
                                <span>Filter</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                              <DropdownMenuLabel>
                                Filter Personnel
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  toast({
                                    description:
                                      "Filter by role feature will be implemented soon.",
                                  })
                                }
                              >
                                By Role
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  toast({
                                    description:
                                      "Filter by department feature will be implemented soon.",
                                  })
                                }
                              >
                                By Department
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() =>
                          toast({
                            description:
                              "New personnel feature will be implemented soon.",
                          })
                        }
                      >
                        <Plus className="h-4 w-4" />
                        New Personnel
                      </Button>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search by name, role, or department..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <Separator className="my-2" />

                    <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                      {filteredPersonnel.length > 0 ? (
                        filteredPersonnel.map((person) => (
                          <div
                            key={person.id}
                            className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                              selectedPersonnel === person.id
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-slate-50"
                            }`}
                            onClick={() => setSelectedPersonnel(person.id)}
                          >
                            <div
                              className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mr-3 ${
                                selectedPersonnel === person.id
                                  ? "bg-primary/20 text-primary"
                                  : "bg-indigo-100 text-indigo-600"
                              }`}
                            >
                              <span className="text-xs font-medium">
                                {person.initials}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{person.name}</span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span>{person.role}</span>
                                <span className="text-slate-300">•</span>
                                <span>{person.department}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No personnel found matching your search.</p>
                          <p className="text-sm mt-1">
                            Try a different search term or add new personnel.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                <div className="text-xs text-muted-foreground px-2">
                  <p>Color coding legend:</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-3 h-3 rounded-full bg-indigo-100"></div>
                    <span>Personnel member</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-3 h-3 rounded-full bg-primary/20"></div>
                    <span>Selected personnel</span>
                  </div>
                </div>
              </div>

              {/* Right panel: Personnel details and preferences */}
              <div className="lg:col-span-2">
                <Card className="overflow-hidden">
                  <Tabs defaultValue="details" className="w-full">
                    <div className="border-b">
                      <TabsList className="flex w-full rounded-none bg-transparent h-10">
                        <TabsTrigger
                          value="details"
                          className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none h-10"
                        >
                          Personnel Details
                        </TabsTrigger>
                        <TabsTrigger
                          value="preferences"
                          className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none h-10"
                        >
                          Schedule Preferences
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent
                      value="details"
                      className="p-4 focus-visible:outline-none focus-visible:ring-0"
                    >
                      {selectedPersonnel ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-4 bg-slate-50 border-0 shadow-none">
                              <h3 className="text-md font-medium mb-3">
                                Personal Information
                              </h3>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    Full Name
                                  </label>
                                  <Input
                                    placeholder="Enter full name"
                                    defaultValue="John Doe"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    Initials
                                  </label>
                                  <Input
                                    placeholder="Enter initials"
                                    defaultValue="JD"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    Email
                                  </label>
                                  <Input
                                    type="email"
                                    placeholder="Enter email address"
                                    defaultValue="john.doe@example.com"
                                  />
                                </div>
                              </div>
                            </Card>

                            <Card className="p-4 bg-slate-50 border-0 shadow-none">
                              <h3 className="text-md font-medium mb-3">
                                Role & Department
                              </h3>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    Role
                                  </label>
                                  <select className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-1">
                                    <option value="administrator">
                                      Administrator
                                    </option>
                                    <option value="staff">Staff</option>
                                    <option value="manager">Manager</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    Department
                                  </label>
                                  <select className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-1">
                                    <option value="management">
                                      Management
                                    </option>
                                    <option value="administration">
                                      Administration
                                    </option>
                                    <option value="support">Support</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    Access Level
                                  </label>
                                  <select className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-1">
                                    <option value="1">Level 1 - Basic</option>
                                    <option value="2">
                                      Level 2 - Intermediate
                                    </option>
                                    <option value="3">
                                      Level 3 - Advanced
                                    </option>
                                    <option value="4">Level 4 - Admin</option>
                                  </select>
                                </div>
                              </div>
                            </Card>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={() =>
                                toast({ description: "Changes discarded" })
                              }
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() =>
                                toast({
                                  description:
                                    "Personnel details saved successfully",
                                })
                              }
                            >
                              {t("common.update")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            Personnel Details
                          </h3>
                          <p className="text-muted-foreground mb-4 max-w-md">
                            Select a personnel member from the list to view or
                            edit their details.
                          </p>
                          <Button
                            onClick={() =>
                              toast({
                                description:
                                  "New personnel feature will be implemented soon.",
                              })
                            }
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Personnel
                          </Button>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent
                      value="preferences"
                      className="p-4 focus-visible:outline-none focus-visible:ring-0"
                    >
                      <SchedulePreferencesTable
                        resourceType="personnel"
                        resourceId={selectedPersonnel}
                      />
                    </TabsContent>
                  </Tabs>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PagePersonnel;
