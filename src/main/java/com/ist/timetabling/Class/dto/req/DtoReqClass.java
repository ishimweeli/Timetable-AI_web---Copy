package com.ist.timetabling.Class.dto.req;

import static com.ist.timetabling.Class.constant.ConstantClassI18n.I18N_CLASS_CAPACITY_MAX;
import static com.ist.timetabling.Class.constant.ConstantClassI18n.I18N_CLASS_CAPACITY_MIN;
import static com.ist.timetabling.Class.constant.ConstantClassI18n.I18N_CLASS_NAME_REQUIRED;
import static com.ist.timetabling.Class.constant.ConstantClassI18n.I18N_CLASS_NAME_SIZE;
import static com.ist.timetabling.Class.constant.ConstantClassI18n.I18N_CLASS_ORGANIZATION_REQUIRED;
import static com.ist.timetabling.Class.constant.ConstantClassI18n.I18N_CLASS_STATUS_INVALID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoReqClass {

    @NotBlank(message = I18N_CLASS_NAME_REQUIRED)
    @Size(min = 2, max = 100, message = I18N_CLASS_NAME_SIZE)
    private String name;

    @NotBlank(message = "Initial is required")
    @Size(max = 5, message = "Initial must not exceed 5 characters")
    private String initial;

    private String color;

    private String section;

    @Min(value = 1, message = I18N_CLASS_CAPACITY_MIN)
    @Max(value = 500, message = I18N_CLASS_CAPACITY_MAX)
    private Integer capacity;

    private Integer locationId;

    @NotNull(message = I18N_CLASS_ORGANIZATION_REQUIRED)
    private Integer organizationId;

    private String comment;

    @Min(value = 0)
    private Integer minLessonsPerDay;

    @Min(value = 0)
    private Integer maxLessonsPerDay;

    @Min(value = 0)
    private Integer latestStartPosition;

    @Min(value = 0)
    private Integer earliestEnd;

    @Min(value = 0)
    private Integer maxFreePeriods;

    private String mainTeacher;

    private Boolean presentEveryDay;

    @Builder.Default
    @Min(value = 0, message = I18N_CLASS_STATUS_INVALID)
    @Max(value = 1, message = I18N_CLASS_STATUS_INVALID)
    private Integer statusId = 1;

    private Integer controlNumber;
    private Integer planSettingsId;
}