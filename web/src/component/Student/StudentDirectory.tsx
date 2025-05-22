import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/component/Ui/card.tsx";
import { Input } from "@/component/Ui/input.tsx";
import { Button } from "@/component/Ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/component/Ui/dialog.tsx";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/component/Ui/form.tsx";
import { Textarea } from "@/component/Ui/textarea.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/Ui/select.tsx";
import { Search, ArrowDownAZ, ArrowUpAZ, Plus, Loader2 } from "lucide-react";
import StudentTable from "./StudentTable";
import StudentProfile from "./StudentProfile";
import { useForm } from "react-hook-form";
import { toast } from "@/component/Ui/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/component/Ui/pagination.tsx";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentByUuid,
} from "@/services/student/StudentService";
import { Student, StudentRequest } from "@/type/student/student";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import DeleteConfirmation from "@/component/Ui/modal/DeleteConfirmation";
import { useI18n } from "@/hook/useI18n";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "@/style/Auth/phone-input.css";

const studentSchema = z.object({
  organizationId: z.number().min(1, "Organization is required"),
  classId: z.number().min(1, "Class is required"),
  fullName: z.string().min(1, "Full name is required"),
  studentIdNumber: z.string().min(1, "Student ID is required"),
  department: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  statusId: z.number().default(1),
});

const StudentDirectory = () => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(0);
  const [studentsPerPage, setStudentsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStudentUuid, setCurrentStudentUuid] = useState<string | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [studentNameToDelete, setStudentNameToDelete] = useState<string>("");
  const [totalStudents, setTotalStudents] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const getAuthToken = () => {
    return localStorage.getItem("authToken") || "";
  };

  const form = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      organizationId: 1,
      classId: 1,
      fullName: "",
      studentIdNumber: "",
      department: "",
      email: "",
      phone: "",
      address: "",
      statusId: 1,
    },
  });

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await getStudents(currentPage, studentsPerPage);

      if(response && response.data) {
        setStudents(response.data);

        // Check if pagination info exists
        if(response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
          setTotalStudents(response.pagination.totalItems || 0);
        }else {
          // If no pagination info, assume there are more records
          setTotalPages(1);
          // Set totalStudents to a higher number to ensure button appears
          setTotalStudents(response.data.length + 10); // Assume there are at least 10 more
        }
      }else {
        console.error("Unexpected API response format:", response);
        setStudents([]);
        setTotalPages(1);
      }
    }catch(error) {
      console.error("Error in fetchStudents:", error);
      setStudents([]);
      setTotalPages(1);
      toast({
        title: "Error",
        description: "Failed to fetch students. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentPage, studentsPerPage]);

  const onSubmit = async (data: z.infer<typeof studentSchema>) => {
    setIsAddingStudent(true);
    try {
      console.log("Form data being submitted:", data);

      const studentRequest: StudentRequest = {
        ...data,
        organizationId: data.organizationId,
        classId: data.classId,
        fullName: data.fullName,
        studentIdNumber: data.studentIdNumber,
      };

      let response;

      if(isEditMode && currentStudentUuid) {
        console.log(`Updating student with uuid: ${currentStudentUuid}`);
        response = await updateStudent(currentStudentUuid, studentRequest);

        toast({
          title: "Student Updated",
          description: `${data.fullName} has been successfully updated.`,
        });
      }else {
        console.log("Creating new student");
        response = await createStudent(studentRequest);

        toast({
          title: "Student Added",
          description: `${data.fullName} has been successfully added.`,
        });
      }

      console.log("API response:", response);

      fetchStudents();
      setIsDialogOpen(false);
      form.reset();
      setIsEditMode(false);
      setCurrentStudentUuid(null);
    }catch(error: any) {
      console.error("Error details:", error);

      toast({
        title: isEditMode ? "Error Updating Student" : "Error Adding Student",
        description:
          error.response?.data?.message ||
          `Failed to ${isEditMode ? "update" : "add"} student. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleViewProfile = async (uuid: string) => {
    try {
      setIsLoading(true);
      console.log(`Fetching student details for uuid: ${uuid}`);

      const response = await getStudentByUuid(uuid);

      if(response && response.data) {
        const student = response.data;
        console.log("Student data for form:", student);

        // Reset form with student data
        form.reset({
          organizationId: student.organizationId || 1,
          classId: student.classId || 1,
          fullName: student.fullName || "",
          studentIdNumber: student.studentIdNumber || "",
          department: student.department || "",
          email: student.email || "",
          phone: student.phone || "",
          address: student.address || "",
          statusId: student.statusId || 1,
        });

        setIsEditMode(true);
        setCurrentStudentUuid(uuid);
        setIsDialogOpen(true);
      }else {
        console.error("Unexpected API response format:", response);
        toast({
          title: "Error",
          description:
            "Failed to load student details. Invalid response format.",
          variant: "destructive",
        });
      }
    }catch(error) {
      console.error("Error fetching student details:", error);
      toast({
        title: "Error",
        description: "Failed to load student details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async (uuid: string) => {
    // Find the student name for the confirmation dialog
    const student = students.find((s) => s.uuid === uuid);
    if(student) {
      setStudentNameToDelete(student.fullName);
      setStudentToDelete(uuid);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDeleteStudent = async () => {
    if(!studentToDelete) return;

    try {
      setIsLoading(true);
      console.log(`Deleting student with uuid: ${studentToDelete}`);

      const response = await deleteStudent(studentToDelete);

      console.log("Delete response:", response);

      toast({
        title: "Student Deleted",
        description: `${studentNameToDelete} has been successfully deleted.`,
      });

      fetchStudents();
    }catch(error) {
      console.error("Error deleting student:", error);
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
      setStudentNameToDelete("");
    }
  };

  const handleAddStudent = () => {
    form.reset({
      organizationId: 1,
      classId: 1,
      fullName: "",
      studentIdNumber: "",
      department: "",
      email: "",
      phone: "",
      address: "",
      statusId: 1,
    });
    setIsEditMode(false);
    setCurrentStudentUuid(null);
    setIsDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const handleLoadMore = async () => {
    if(
      isLoadingMore ||
      (students.length >= totalStudents && totalStudents > 0)
    )
      return;

    setIsLoadingMore(true);
    try {
      // Always load 5 more students
      const nextPage = Math.floor(students.length / 5);
      const response = await getStudents(nextPage, 5);

      if(response && response.data) {
        // Append new students to existing list instead of replacing
        setStudents((prevStudents) => {
          const existingIds = new Set(prevStudents.map((s) => s.uuid));
          const newStudents = response.data.filter(
            (s) => !existingIds.has(s.uuid),
          );
          return [...prevStudents, ...newStudents];
        });

        // Update pagination info
        if(response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
          setTotalStudents(response.pagination.totalItems || 0);
        }
      }
    }catch(error) {
      console.error("Error loading more students:", error);
      toast({
        title: "Error",
        description: "Failed to load more students. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Setup intersection observer for infinite scrolling
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if(isLoadingMore) return;

      if(observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if(entries[0].isIntersecting && students.length < totalStudents) {
            handleLoadMore();
          }
        },
        { threshold: 0.5 },
      );

      if(node) observerRef.current.observe(node);
    },
    [isLoadingMore, students.length, totalStudents],
  );

  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentIdNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <Card>
        <div className="sticky top-0 z-10 bg-background border-b">
          <CardHeader className="p-4 pb-0">
            <div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0 items-start md:items-center">
              <CardTitle>{t("student.directory.title")}</CardTitle>
              <Button variant="outline" size="sm" onClick={handleAddStudent}>
                <Plus className="h-4 w-4 mr-1" />
                {t("student.actions.add")}
              </Button>
            </div>
          </CardHeader>

          <div className="p-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("student.list.searchPlaceholder")}
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="px-4 pb-2">
            <div className="flex justify-between items-center">
              <div className="grid grid-cols-5 w-full text-sm font-medium text-muted-foreground">
                <div>{t("student.fields.studentId")}</div>
                <div>{t("student.fields.fullName")}</div>
                <div>{t("student.fields.department")}</div>
                <div>{t("student.fields.status")}</div>
                <div className="text-right">{t("common.actions")}</div>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <div
            className="overflow-y-auto"
            style={{
              maxHeight: "calc(100vh - 250px)",
              scrollBehavior: "smooth",
            }}
          >
            <div className="px-4">
              {selectedStudent ? (
                <StudentProfile
                  studentId={selectedStudent}
                  onClose={() => setSelectedStudent(null)}
                />
              ) : (
                <>
                  <StudentTable
                    students={filteredStudents}
                    onViewProfile={handleViewProfile}
                    onDeleteStudent={handleDeleteStudent}
                    isLoading={isLoading}
                  />

                  {isLoadingMore ? (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading more students...
                      </div>
                    </div>
                  ) : students.length < totalStudents ? (
                    <div className="h-8" />
                  ) : (
                    <div className="text-center py-3 text-xs text-muted-foreground">
                      End of list - {students.length} students loaded
                    </div>
                  )}
                </>
              )}
            </div>

            {!isLoadingMore &&
              students.length > 0 &&
              students.length < totalStudents && (
                <div className="mt-4 mb-6 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="min-w-[200px]"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Students
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({students.length}/{totalStudents})
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              )}

            {!isLoading && totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={currentPage === page}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1),
                          )
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Student" : "Add New Student"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("student.fields.fullName")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("student.form.fullNamePlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="studentIdNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("student.fields.studentId")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("student.form.studentIdPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("student.fields.grade")}</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("student.form.gradePlaceholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">{t("student.grade.freshman")}</SelectItem>
                          <SelectItem value="2">{t("student.grade.sophomore")}</SelectItem>
                          <SelectItem value="3">{t("student.grade.junior")}</SelectItem>
                          <SelectItem value="4">{t("student.grade.senior")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("student.fields.department")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("student.form.departmentPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("student.form.email")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("student.form.emailPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("student.form.phone")}</FormLabel>
                      <FormControl>
                        <PhoneInput
                          international
                          countryCallingCodeEditable={false}
                          defaultCountry="US"
                          placeholder={t("student.form.phonePlaceholder")}
                          value={field.value}
                          onChange={field.onChange}
                          className={form.formState.errors.phone ? "error" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="statusId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("student.fields.status")}</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("student.form.statusPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">{t("student.status.active")}</SelectItem>
                        <SelectItem value="2">{t("student.status.pending")}</SelectItem>
                        <SelectItem value="3">{t("student.status.inactive")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("student.form.address")}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("student.form.addressPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    {t("common.cancel")}
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isAddingStudent}>
                  {isAddingStudent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? t("common.update") : t("common.create")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmation
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDeleteStudent}
        isDeleting={isLoading}
        title={t("common.deleteConfirmTitle")}
        description={`${t("common.deleteConfirmMessage").replace("{moduleName}", "student")} ${studentNameToDelete ? `(${studentNameToDelete})` : ""}`}
        showTrigger={false}
      />
    </div>
  );
};

export default StudentDirectory;
