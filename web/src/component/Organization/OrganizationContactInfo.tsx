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
import {Input, InputPhone} from "@/component/Ui/input";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "@/style/Auth/phone-input.css";

const OrganizationContactInfo = () => {
    const { t } = useI18n();
    const form = useFormContext();

    return (
        <div className="space-y-4 istui-timetable__main_form_section">
            <h3 className="text-lg font-medium istui-timetable__main_form_title">
                {t("organization.form.contactInfo")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 istui-timetable__main_form_grid">
                <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                        <FormItem className="istui-timetable__main_form_field">
                            <FormLabel className="istui-timetable__main_form_input_label">
                                {t("organization.form.email")}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder={t("organization.form.emailPlaceholder")}
                                    {...field}
                                    className="istui-timetable__main_form_input"
                                />
                            </FormControl>
                            <FormMessage className="istui-timetable__main_form_input_error_message" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                        <FormItem className="istui-timetable__main_form_field">
                            <FormLabel className="istui-timetable__main_form_input_label">
                                {t("organization.form.phone")}
                            </FormLabel>
                            <FormControl>
                                <InputPhone
                                    placeholder={t("organization.form.phonePlaceholder")}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage className="istui-timetable__main_form_input_error_message" />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
};

export default OrganizationContactInfo;
