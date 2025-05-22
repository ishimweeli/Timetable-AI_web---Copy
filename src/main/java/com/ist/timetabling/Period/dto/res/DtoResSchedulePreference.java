package com.ist.timetabling.Period.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DtoResSchedulePreference {
    private Integer id;
    private String uuid;
    private Integer periodId;
    private Integer dayOfWeek;
    private Boolean cannotTeach;
    private Boolean prefersToTeach;
    private Boolean mustTeach;
    private Boolean dontPreferToTeach;
    private Boolean mustScheduleClass;
    private Boolean mustNotScheduleClass;
    private Boolean prefersToScheduleClass;
    private Boolean prefersNotToScheduleClass;
    private Boolean applies;
    private String reason;
    private LocalDateTime effectiveFrom;
    private LocalDateTime effectiveTo;
    private Boolean isRecurring;
    private Integer organizationId;
    private Integer createdBy;
    private Integer modifiedBy;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
    private Integer statusId;
    private Boolean isDeleted;
}