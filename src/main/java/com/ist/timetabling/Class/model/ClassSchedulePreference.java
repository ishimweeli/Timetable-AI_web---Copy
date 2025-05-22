package com.ist.timetabling.Class.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassSchedulePreference {
    private Integer id;
    private String uuid;
    private Integer periodId;
    private Integer dayOfWeek;
    
    // Class-specific preference fields
    private Boolean mustScheduleClass;
    private Boolean mustNotScheduleClass;
    private Boolean prefersToScheduleClass;
    private Boolean prefersNotToScheduleClass;
    
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
    
    @JsonIgnore
    public boolean hasPreference() {
        return mustScheduleClass != null && mustScheduleClass
            || mustNotScheduleClass != null && mustNotScheduleClass
            || prefersToScheduleClass != null && prefersToScheduleClass
            || prefersNotToScheduleClass != null && prefersNotToScheduleClass;
    }
    
    @JsonIgnore
    public String getActivePreferenceType() {
        if (mustScheduleClass != null && mustScheduleClass) {
            return "must_schedule_class";
        } else if (mustNotScheduleClass != null && mustNotScheduleClass) {
            return "must_not_schedule_class";
        } else if (prefersToScheduleClass != null && prefersToScheduleClass) {
            return "prefers_to_schedule_class";
        } else if (prefersNotToScheduleClass != null && prefersNotToScheduleClass) {
            return "prefer_not_to_schedule_class";
        } else {
            return null;
        }
    }
} 