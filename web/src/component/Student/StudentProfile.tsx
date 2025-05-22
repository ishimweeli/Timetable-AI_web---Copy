import React from "react";
import { Button } from "@/component/Ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/component/Ui/card.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/component/Ui/tabs.tsx";
import { Badge } from "@/component/Ui/badge.tsx";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Map,
  Award,
  BookOpen,
  Clock,
  GraduationCap,
  User,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/component/Ui/dialog.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/component/Ui/form.tsx";
import { Input } from "@/component/Ui/input.tsx";
import { Textarea } from "@/component/Ui/textarea.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/Ui/select.tsx";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetStudentByUuidQuery, useUpdateStudentMutation, useDeleteStudentMutation } from "@/store/Student/ApiStudent";
import { useToast } from "@/component/Ui/use-toast";
import { useI18n } from "@/hook/useI18n";
import { useForm } from "react-hook-form";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "@/style/Auth/phone-input.css";

interface StudentProfileProps {
  studentId: string;
  onClose: () => void;
}

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
  statusId: number,
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

const StudentProfile: React.FC<StudentProfileProps> = ({
  studentId,
  onClose,
}) => {
  const { t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { data: studentData, isLoading: isLoadingStudent, error: studentError } = 
    useGetStudentByUuidQuery(studentId, { skip: !studentId });
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();
  
  const student = studentData?.data;

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm({
    defaultValues: {
      fullName: student?.fullName || "",
      studentIdNumber: student?.studentIdNumber || "",
      classId: student?.classId || 1,
      department: student?.department || "",
      email: student?.email || "",
      phone: student?.phone || "",
      statusId: student?.statusId || 1,
      organizationId: student?.organizationId || null,
      address: student?.address || "",
    },
  });

  React.useEffect(() => {
    if (student) {
      form.reset({
        fullName: student.fullName || "",
        studentIdNumber: student.studentIdNumber || "",
        classId: student.classId || 1,
        department: student.department || "",
        email: student.email || "",
        phone: student.phone || "",
        statusId: student.statusId || 1,
        organizationId: student.organizationId || null,
        address: student.address || "",
      });
    }
  }, [student, form]);

  if(isLoadingStudent) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  if(studentError || !student) {
    return (
      <div className="p-8 text-center">
        <p>{t("student.errors.notFound")}</p>
        <Button onClick={() => onClose()} className="mt-4">
          {t("common.goBack")}
        </Button>
      </div>
    );
  }

  const handleUpdate = async (data: any) => {
    setIsSubmitting(true);
    try {
      const nameParts = data.fullName.split(/\s+/, 2);
      const updateData = {
        ...data,
        firstName: nameParts[0],
        lastName: nameParts.length > 1 ? nameParts[1] : "",
      };
      
      await updateStudent({
        uuid: studentId,
        student: updateData,
      }).unwrap();
      
      toast({
        title: t("common.success"),
        description: t("student.success.updated"),
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        title: t("common.error"),
        description: t("student.errors.updateFailed"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteStudent(studentId).unwrap();
      toast({
        title: t("common.success"),
        description: t("student.success.deleted"),
      });
      onClose();
      navigate("/students", { replace: true });
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        title: t("common.error"),
        description: t("student.errors.deleteFailed"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleClose = () => {
    onClose();
    navigate("/students", { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleClose}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Directory
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{student.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <Badge className="absolute -bottom-2 -right-2 px-2">
                    {student.grade}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {student.email || "No email provided"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {student.phone || "No phone provided"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">ID: {student.studentId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Map className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {student.address || "No address provided"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  Achievements & Awards
                </h3>
                <div className="flex flex-wrap gap-1">
                  {student.awards.map((award) => (
                    <Badge key={award} variant="secondary">
                      {award}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Tabs defaultValue="info">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">{t('student.profile.tabs.info')}</TabsTrigger>
              <TabsTrigger value="academic">{t('student.profile.tabs.academic')}</TabsTrigger>
              <TabsTrigger value="attendance">{t('student.profile.tabs.timetable')}</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-base">{t('student.fields.fullName')}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t('student.fields.department')}
                      </div>
                      <div className="font-medium">
                        {student.department || "Not specified"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t('student.fields.status')}
                      </div>
                      <div className="font-medium">
                        <Badge variant={getStatusVariant(student.statusId)}>
                          {getStatusText(student.statusId)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t('student.fields.organizationId')}
                      </div>
                      <div className="font-medium">
                        {student.organizationId}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t('student.fields.classId')}
                      </div>
                      <div className="font-medium">
                        {getGradeText(student.classId)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t('student.fields.createdDate')}
                      </div>
                      <div className="font-medium">
                        {new Date(student.createdDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {t('student.fields.modifiedDate')}
                      </div>
                      <div className="font-medium">
                        {new Date(student.modifiedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academic" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-base flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {t('student.profile.tabs.academic')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      Academic information is not available in the current API.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-base flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {t('student.profile.tabs.timetable')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      Attendance information is not available in the current
                      API.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{t('common.edit')}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpdate)}
              className="space-y-4 mt-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('student.fields.fullName')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('student.fields.fullName')} {...field} />
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
                      <FormLabel>{t('student.fields.studentId')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('student.fields.studentId')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('student.fields.grade')}</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('student.fields.grade')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Freshman</SelectItem>
                          <SelectItem value="2">Sophomore</SelectItem>
                          <SelectItem value="3">Junior</SelectItem>
                          <SelectItem value="4">Senior</SelectItem>
                          <SelectItem value="5">Graduate</SelectItem>
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
                      <FormLabel>{t('student.fields.department')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('student.fields.department')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('student.form.email')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('student.form.email')}
                          type="email"
                          {...field}
                        />
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
                      <FormLabel>{t('student.form.phone')}</FormLabel>
                      <FormControl>
                        <PhoneInput
                          international
                          countryCallingCodeEditable={false}
                          defaultCountry="US"
                          placeholder={t('student.form.phonePlaceholder')}
                          value={field.value}
                          onChange={field.onChange}
                          className={form.formState.errors.phone ? "error" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="statusId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('student.fields.status')}</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('student.fields.status')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Active</SelectItem>
                          <SelectItem value="2">Probation</SelectItem>
                          <SelectItem value="3">Academic Warning</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organizationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('student.fields.organizationId')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('student.form.address')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('student.form.address')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isUpdating ? t('common.updating') : t('common.update')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('common.delete')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              {t('student.profile.delete.confirmation', { name: student.name })}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? t('common.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentProfile;
