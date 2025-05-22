package com.ist.timetabling.PlanSetting.dto.req;

import java.time.LocalTime;
import java.util.List;

import static com.ist.timetabling.PlanSetting.Constant.ConstantPlanningSettingsI18n.I18N_PLANNING_SETTINGS_DAYS_PER_WEEK_MAX;
import static com.ist.timetabling.PlanSetting.Constant.ConstantPlanningSettingsI18n.I18N_PLANNING_SETTINGS_DAYS_PER_WEEK_MIN;
import static com.ist.timetabling.PlanSetting.Constant.ConstantPlanningSettingsI18n.I18N_PLANNING_SETTINGS_DAYS_PER_WEEK_REQUIRED;
import static com.ist.timetabling.PlanSetting.Constant.ConstantPlanningSettingsI18n.I18N_PLANNING_SETTINGS_END_TIME_REQUIRED;
import static com.ist.timetabling.PlanSetting.Constant.ConstantPlanningSettingsI18n.I18N_PLANNING_SETTINGS_ORGANIZATION_ID_REQUIRED;
import static com.ist.timetabling.PlanSetting.Constant.ConstantPlanningSettingsI18n.I18N_PLANNING_SETTINGS_PERIODS_PER_DAY_MIN;
import static com.ist.timetabling.PlanSetting.Constant.ConstantPlanningSettingsI18n.I18N_PLANNING_SETTINGS_PERIODS_PER_DAY_REQUIRED;
import static com.ist.timetabling.PlanSetting.Constant.ConstantPlanningSettingsI18n.I18N_PLANNING_SETTINGS_START_TIME_REQUIRED;
import static com.ist.timetabling.PlanSetting.Constant.ConstantPlanningSettingsI18n.I18N_PLANNING_SETTINGS_TIME_BLOCK_TYPES_REQUIRED;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DtoReqPlanningSettings {

    @NotNull(message = I18N_PLANNING_SETTINGS_PERIODS_PER_DAY_REQUIRED)
    @Min(value = 1, message = I18N_PLANNING_SETTINGS_PERIODS_PER_DAY_MIN)
    private Integer periodsPerDay;

    @NotNull(message = I18N_PLANNING_SETTINGS_DAYS_PER_WEEK_REQUIRED)
    @Min(value = 1, message = I18N_PLANNING_SETTINGS_DAYS_PER_WEEK_MIN)
    @Max(value = 7, message = I18N_PLANNING_SETTINGS_DAYS_PER_WEEK_MAX)
    private Integer daysPerWeek;

    @NotNull(message = I18N_PLANNING_SETTINGS_START_TIME_REQUIRED)
    private LocalTime startTime;

    @NotNull(message = I18N_PLANNING_SETTINGS_END_TIME_REQUIRED)
    private LocalTime endTime;

    @NotEmpty(message = I18N_PLANNING_SETTINGS_TIME_BLOCK_TYPES_REQUIRED)
    @Valid
    private List<DtoReqTimeBlockType> timeBlockTypes;

    @NotBlank(message = I18N_PLANNING_SETTINGS_ORGANIZATION_ID_REQUIRED)
    private String organizationId;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;

    private String category = "DEFAULT";

    private java.time.LocalDate planStartDate;
    private java.time.LocalDate planEndDate;

    private Boolean includeWeekends = true;
}