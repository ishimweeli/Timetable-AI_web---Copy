package com.ist.timetabling.Period.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import static com.ist.timetabling.Period.constant.ConstantPeriodI18n.*;
import java.util.Arrays;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DtoReqPeriod {

    @NotNull(message = I18N_PERIOD_ORGANIZATION_REQUIRED)
    private Integer organizationId;

    @NotBlank(message = I18N_PERIOD_NAME_REQUIRED)
    private String name;

    @NotBlank(message = I18N_PERIOD_STARTTIME_REQUIRED)
    private String startTime;

    @NotBlank(message = I18N_PERIOD_ENDTIME_REQUIRED)
    private String endTime;

    @NotBlank(message = I18N_PERIOD_PERIODTYPE_REQUIRED)
    private String periodType;

    private List<Integer> days;

    @NotNull(message = I18N_PERIOD_NUMBER_REQUIRED)
    private Integer periodNumber;

    @NotNull(message = I18N_PERIOD_DURATION_REQUIRED)
    private Integer durationMinutes;

    private Boolean allowScheduling = true;

    private Boolean showInTimetable = true;

    private Boolean allowConflicts = false;

    private Boolean allowLocationChange = false;
    
    private Integer planSettingsId;
}
