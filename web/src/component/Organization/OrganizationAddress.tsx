import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/component/Ui/form";
import { Textarea } from "@/component/Ui/textarea";
import { useI18n } from "@/hook/useI18n";

const OrganizationAddress = () => {
  const { t } = useI18n();
  const form = useFormContext();

  return (
    <div className="space-y-4 istui-timetable__main_form_section">
      <h3 className="text-lg font-medium istui-timetable__main_form_title">
        {t("organization.form.addressDetails")}
      </h3>

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem className="istui-timetable__main_form_field">
            <FormLabel className="istui-timetable__main_form_input_label">
              {t("organization.form.address")}
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("organization.form.addressPlaceholder")}
                {...field}
                className="resize-none h-24 istui-timetable__main_form_input_textarea"
              />
            </FormControl>
            <FormMessage className="istui-timetable__main_form_input_error_message" />
          </FormItem>
        )}
      />
    </div>
  );
};

export default OrganizationAddress;
