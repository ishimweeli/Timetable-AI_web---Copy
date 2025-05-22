import React, { useEffect } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/component/Ui/form";
import { Input } from "@/component/Ui/input";
import { Textarea } from "@/component/Ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/Ui/select";
import { Button } from "@/component/Ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Student } from "@/type/student/student";
import { useI18n } from "@/hook/useI18n";
import { Loader2, AlertCircle, Trash2,X } from "lucide-react";
import OrganizationSelector from "@/component/Organization/OrganizationSelector";
import { useAppSelector } from "@/hook/useAppRedux";
import { Alert, AlertDescription } from "@/component/Ui/alert";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "@/style/Auth/phone-input.css";
import { useGetClassesQuery } from "@/store/Class/ApiClass";

const studentSchema = z.object({
  organizationId: z.number().min(1, "Organization is required"),
  classId: z.number().min(1, "Class is required"),
  fullName: z.string().min(1, "Full name is required"),
  studentIdNumber: z.string().min(1, "Student ID is required"),
  department: z.string().optional(),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  phone: z.string().optional(),
  address: z.string().optional(),
  statusId: z.number().default(1),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  onSubmit: (data: StudentFormData) => void;
  initialData?: Student;
  isSubmitting?: boolean;
  footer?: React.ReactNode;
  onDelete?: () => void;
  isDeleting?: boolean;
  error?: string | null;
}

const StudentForm: React.FC<StudentFormProps> = ({
  onSubmit,
  initialData,
  isSubmitting = false,
  footer,
  onDelete,
  isDeleting = false,
  error = null,
}) => {
  const { t } = useI18n();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.roleName === "ADMIN";

  // Fetch classes for dropdown
  const { data: classesResponse, isLoading: isLoadingClasses } = useGetClassesQuery({});
  const classes = classesResponse?.data || [];

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      organizationId: isAdmin ? 0 : user?.organizationId ? Number(user.organizationId) : 0,
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

  useEffect(() => {
    if(initialData) {
      form.reset({
        organizationId:
          Number(initialData.organizationId) ||
          (isAdmin ? 0 : user?.organizationId ? Number(user.organizationId) : 0),
        classId: Number(initialData.classId) || 1,
        fullName: initialData.fullName || "",
        studentIdNumber: initialData.studentIdNumber || "",
        department: initialData.department || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        statusId: Number(initialData.statusId) || 1,
      });
    }else {
      form.reset({
        organizationId: isAdmin ? 0 : user?.organizationId ? Number(user.organizationId) : 0,
        classId: 1,
        fullName: "",
        studentIdNumber: "",
        department: "",
        email: "",
        phone: "",
        address: "",
        statusId: 1,
      });
    }
  }, [initialData, form, isAdmin, user?.organizationId]);

  useEffect(() => {
    if (classes.length > 0 && !form.watch('classId')) {
      form.setValue('classId', classes[0].id);
    }
  }, [classes, form]);

  const handleFormSubmit = (data: StudentFormData) => {
    form.clearErrors("organizationId");
    if(!data.organizationId || data.organizationId < 1) {
      form.setError("organizationId", {
        type: "manual",
        message: "Organization is required",
      });
      return;
    }
    console.log('Submitting student with classId:', data.classId, 'data:', data);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {isAdmin && (
          <FormField
            control={form.control}
            name="organizationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="istui-timetable__main_form_input_label">{t("student.form.organization")}</FormLabel>
                <FormControl>
                  <OrganizationSelector
                    selectedOrganizationId={field.value || undefined}
                    onOrganizationChange={field.onChange}
                    className="mt-1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {!isAdmin && user?.organizationId && (
          <input
            type="hidden"
            name="organizationId"
            value={user.organizationId}
            onChange={(e) => form.setValue("organizationId", Number(e.target.value))}
          />
        )}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("student.fields.fullName")}</FormLabel>
              <FormControl>
                <Input placeholder={t("student.form.fullNamePlaceholder")} {...field} required />
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
                <Input
                  placeholder={t("student.form.studentIdPlaceholder")}
                  {...field}
                  required
                  className={
                    error && error.includes("Student ID") ? "border-red-500" : ""
                  }
                />
              </FormControl>
              <FormMessage />
              {error && error.includes("Student ID") && (
                <p className="text-sm text-red-500 mt-1 istui-timetable__main_form_input_error_message">
                  {error}
                </p>
              )}
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="classId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("student.fields.class")}</FormLabel>
                <select
                  className="p-2 border rounded w-full"
                  value={field.value}
                  onChange={e => field.onChange(Number(e.target.value))}
                  disabled={isLoadingClasses}
                  required
                >
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="istui-timetable__main_form_input_label">{t("student.fields.department")}</FormLabel>
                <FormControl>
                  <Input
                    className="istui-timetable__main_form_input"
                    placeholder={t("student.form.departmentPlaceholder")}
                    {...field}
                  />
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
                <FormLabel className="flex items-center">{t("student.form.email")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("student.form.emailPlaceholder")}
                    {...field}
                    required
                    className={
                      error && error.includes("Email") ? "border-red-500" : ""
                    }
                  />
                </FormControl>
                <FormMessage />
                {error && error.includes("Email") && (
                  <p className="text-sm text-red-500 mt-1">{error}</p>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="istui-timetable__main_form_input_label">{t("student.form.phone")}</FormLabel>
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
              <FormLabel className="istui-timetable__main_form_input_label">{t("student.fields.status")}</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                defaultValue={String(field.value)}
                value={String(field.value)}
              >
                <FormControl>
                  <SelectTrigger className="istui-timetable__main_form_input_select">
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
              <FormLabel className="istui-timetable__main_form_input_label">{t("student.form.address")}</FormLabel>
              <FormControl>
                <Textarea
                  className="istui-timetable__main_form_input_textarea"
                  placeholder={t("student.form.addressPlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {footer ? (
          <div className="mt-6">{footer}</div>
        ) : (
          <div className="flex justify-between mt-6">
            <Button type="button" variant="outline" onClick={() => {}}>
              <X/>
              {t("common.cancel")}
            </Button>
            {initialData && onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                {t("common.delete")}
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? t("common.update") : t("common.save")}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default StudentForm;
