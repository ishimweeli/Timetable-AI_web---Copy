package com.ist.timetabling.Period.dto.req;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DtoReqSchedulePreference {
    private Integer periodId;
    private Integer dayOfWeek;
    private Integer organizationId;
    private Boolean cannotTeach;
    private Boolean prefersToTeach;
    private Boolean mustTeach;
    private Boolean applies;
    private Boolean dontPreferToTeach;
    private String reason;
    private LocalDateTime effectiveFrom;
    private LocalDateTime effectiveTo;
    private Boolean isRecurring;
    private Boolean mustScheduleClass;
    private Boolean mustNotScheduleClass;
    private Boolean prefersNotToScheduleClass;
    private Boolean prefersToScheduleClass;
}