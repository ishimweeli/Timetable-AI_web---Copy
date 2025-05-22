package com.ist.timetabling.Rule.dto.req;

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
public class DtoReqRuleUpdate {

    @Size(max = 255, message = I18N_RULE_NAME_SIZE)
    private String name;

    @Size(max = 50, message = I18N_RULE_TYPE_SIZE)
    private String initials;

    private String data;

    private Integer priority;

    private Boolean isEnabled;

    private Integer statusId;

    private Integer planSettingsId;

    private String comment;

}