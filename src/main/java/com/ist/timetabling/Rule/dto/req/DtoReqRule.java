package com.ist.timetabling.Rule.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import static com.ist.timetabling.Rule.constant.ConstantRuleI18n.*;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoReqRule {

    @NotBlank(message = I18N_RULE_NAME_REQUIRED)
    @Size(max = 255, message = I18N_RULE_NAME_SIZE)
    private String name;

    @NotBlank(message = I18N_RULE_TYPE_REQUIRED)
    @Size(max = 50, message = I18N_RULE_TYPE_SIZE)
    private String initials;

    @NotBlank(message = I18N_RULE_DATA_REQUIRED)
    private String data;

    @NotNull(message = I18N_RULE_PRIORITY_REQUIRED)
    private Integer priority;

    @NotNull(message = I18N_RULE_ENABLED_REQUIRED)
    private boolean isEnabled;

    @NotNull(message = I18N_RULE_ORG_ID_REQUIRED)
    private Integer organizationId;

    private Integer planSettingsId;

    @NotNull(message = I18N_RULE_STATUS_ID_REQUIRED)
    private Integer statusId;

    private String comment;

}