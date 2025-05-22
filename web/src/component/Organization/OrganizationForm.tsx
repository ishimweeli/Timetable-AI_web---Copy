import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/component/Ui/form";
import { Separator } from "@/component/Ui/separator";
import { OrganizationFormData } from "@/type/Organization/TypeOrganization";
import { useI18n } from "@/hook/useI18n";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "@/style/Auth/phone-input.css";
import { useLazyCheckEmailExistsQuery } from "@/store/Organization/ApiOrganization";
import { useToast } from "@/hook/useToast";
import OrganizationBasicDetails from "./OrganizationBasicDetails";
import OrganizationContactInfo from "./OrganizationContactInfo";
import OrganizationAddress from "./OrganizationAddress";
import OrganizationFormActions from "./OrganizationFormActions";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/component/Ui/card.tsx";

interface OrganizationFormProps {
  organizationData: OrganizationFormData | null;
  isNewOrganization: boolean;
  onSave: (data: OrganizationFormData) => void;
  onDelete: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isDeleting: boolean;
  currentOrgUuid?: string | null;
  className?: string;
  isAdmin?: boolean;
  hasEditPermission?: boolean;
}

const OrganizationForm: React.FC<OrganizationFormProps> = ({
  organizationData,
  isNewOrganization,
  onSave,
  onDelete,
  onCancel,
  isLoading,
  isDeleting,
  currentOrgUuid,
  className,
  isAdmin = false,
  hasEditPermission = false
}) => {
  const { t } = useI18n();
  const { toast } = useToast();
  const [checkEmailExists, { isLoading: isCheckingEmail }] =
    useLazyCheckEmailExistsQuery();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = z.object({
    name: z
      .string()
      .min(2, { message: t("validation.organization.name.required") })
      .max(100, { message: t("validation.organization.name.size") }),
    address: z
      .string()
      .min(1, { message: t("validation.organization.address.required") }),
    contactEmail: z
      .string()
      .email({ message: t("validation.organization.email.invalid") })
      .optional()
      .or(z.literal("")),
    contactPhone: z
      .string()
      .min(1, { message: t("validation.organization.phone.required") })
      .refine((value) => !value || isValidPhoneNumber(value), {
        message: t("validation.organization.phone.invalid"),
      }),
    statusId: z.number().optional(),
  });

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      contactEmail: "",
      contactPhone: "",
      statusId: 1,
    },
  });

  useEffect(() => {
    if(organizationData) {
      form.reset({
        name: organizationData.name || "",
        address: organizationData.address || "",
        contactEmail: organizationData.contactEmail || "",
        contactPhone: organizationData.contactPhone || "",
        statusId: organizationData.statusId || 1,
      });
    } else if(isNewOrganization) {
      form.reset({
        name: "",
        address: "",
        contactEmail: "",
        contactPhone: "",
        statusId: 1,
      });
    }
  }, [organizationData, isNewOrganization, form]);

  const onSubmit = async (data: OrganizationFormData) => {
    if(isSubmitting || isLoading || isDeleting || isCheckingEmail) return;
    setIsSubmitting(true);
    try {
      if(data.contactEmail) {
        const response = await checkEmailExists({
          email: data.contactEmail,
          excludeUuid: currentOrgUuid,
        });
        if(response.data?.data?.exists) {
          toast({
            description: t("organization.errors.emailAlreadyExists"),
            variant: "destructive",
          });
          form.setError("contactEmail", {
            type: "manual",
            message: t("organization.errors.emailAlreadyExists"),
          });
          setIsSubmitting(false);
          return;
        }
      }
      onSave(data);
    }catch(error) {
      console.error("Error checking email uniqueness:", error);
      onSave(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${className}`}>
      <div className="mb-6 p-6 istui-timetable__main_form">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 h-full flex flex-col"
          >
            <div className="space-y-5 flex-1 overflow-auto p-4">
              <OrganizationBasicDetails />
              <OrganizationContactInfo />
              <OrganizationAddress />
            </div>
            <OrganizationFormActions
              isNewOrganization={isNewOrganization}
              onDelete={onDelete}
              onCancel={onCancel}
              isLoading={isLoading || isSubmitting || isCheckingEmail}
              isDeleting={isDeleting}
              isAdmin={isAdmin}
              hasEditPermission={hasEditPermission}
            />
          </form>
        </Form>
      </div>
    </div>
  );
};

export default OrganizationForm;
