package com.ist.timetabling.ClassBand.dto.res;

import com.ist.timetabling.Period.dto.res.DtoResSchedulePreference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DtoResClassBand {
    private String uuid;
    private Integer organizationId;
    private Integer planSettingsId;
    private String name;
    private String description;
    private String color;
    private Integer minLessonsPerDay;
    private Integer maxLessonsPerDay;
    private Integer latestStartPosition;
    private Integer earliestEnd;
    private Integer maxFreePeriods;
    private Boolean presentEveryDay;
    private Set<String> participatingClassUuids;
    private Integer statusId;
    private Boolean isDeleted;
    private String createdBy;
    private String modifiedBy;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;

    private DtoResSchedulePreference primarySchedulePreference;
    private List<DtoResSchedulePreference> schedulePreferences;

    private Integer controlNumber;
}