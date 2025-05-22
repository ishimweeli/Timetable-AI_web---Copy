package com.ist.timetabling.binding.dto.req;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Max;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import static com.ist.timetabling.Rule.constant.ConstantRuleI18n.I18N_ORGANIZATION_NOT_FOUND;
import static com.ist.timetabling.Rule.constant.ConstantRuleI18n.I18N_RULE_NAME_REQUIRED;
import static com.ist.timetabling.binding.constant.ConstantBindingI18n.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DtoReqBinding {

    @NotBlank(message = I18N_ORGANIZATION_NOT_FOUND)
    private String organizationUuid;

    private String teacherUuid;

    private String subjectUuid;

    private String classUuid;

    private String roomUuid;

    private String ClassBandUuid;

    @NotNull(message = I18N_BINDING_PERIODS_REQUIRED)
    @Min(value = 1, message = I18N_BINDING_PERIODS_MIN)
    @Max(value = 20, message = I18N_BINDING_PERIODS_MAX)
    private Integer periodsPerWeek;

    private Boolean isFixed = false;

    @Min(value = 0, message = I18N_BINDING_PRIORITY_MIN)
    @Max(value = 10, message = I18N_BINDING_PRIORITY_MAX)
    private Integer priority = 0;

    private String notes;

    private Integer statusId = 1;

    private List<String> ruleUuids;
    
    private Integer planSettingsId;
}