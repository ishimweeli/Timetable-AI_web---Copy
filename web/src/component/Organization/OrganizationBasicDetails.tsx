import React from "react";
import { useFormContext } from "react-hook-form";
import { useI18n } from "@/hook/useI18n";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/component/Ui/form";
import { Input } from "@/component/Ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/Ui/select";

const OrganizationBasicDetails = () => {
  const { t } = useI18n();
  const form = useFormContext();

  return (
    <div className="space-y-4 istui-timetable__main_form_section">
      <h3 className="text-lg font-medium istui-timetable__main_form_title">
        {t("organization.form.basicDetails")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 istui-timetable__main_form_grid">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="istui-timetable__main_form_field">
              <FormLabel className="istui-timetable__main_form_input_label">
                {t("organization.form.name")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("organization.form.namePlaceholder")}
                  {...field}
                  className="istui-timetable__main_form_input"
                />
              </FormControl>
              <FormMessage className="istui-timetable__main_form_error" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="statusId"
          render={({ field }) => (
            <FormItem className="istui-timetable__main_form_field">
              <FormLabel className="istui-timetable__main_form_input_label">
                {t("organization.form.status")}
              </FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value?.toString()}
                className="istui-timetable__main_form_input_select"
              >
                <FormControl>
                  <SelectTrigger className="istui-timetable__main_form_input_select">
                    <SelectValue
                      placeholder={t("organization.form.statusPlaceholder")}
                      className="istui-timetable__main_form_input_select"
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="istui-timetable__main_form_input_select">
                  <SelectItem
                    value="1"
                    className="istui-timetable__main_form_select_item"
                  >
                    {t("status.active")}
                  </SelectItem>
                  <SelectItem
                    value="2"
                    className="istui-timetable__main_form_select_item"
                  >
                    {t("status.inactive")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="istui-timetable__main_form_error" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default OrganizationBasicDetails;
