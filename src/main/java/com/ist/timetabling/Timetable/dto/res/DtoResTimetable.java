package com.ist.timetabling.Timetable.dto.res;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class DtoResTimetable {
    private Integer id;
    private String uuid;
    private String name;
    private String academicYear;
    private String semester;
    private String generatedBy;
    private Integer organizationId;
    private String schoolStartTime;
    private String schoolEndTime;
    private Integer statusId;
    private String description;
    private Boolean isPublished;
    private Integer startDay;
    private Integer endDay;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
    private LocalDateTime generatedDate;
    private String planSettingUuid;
    private java.time.LocalDate planStartDate;
    private java.time.LocalDate planEndDate;
    private Boolean includeWeekends;
    private Integer generationDuration;
    private Integer generationSuccessCount;
    private Integer generationFailureCount;
    private List<DtoResTimetableEntry> entries;
    private List<Integer> timetablePlan;

}
