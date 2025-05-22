package com.ist.timetabling.PlanSetting.dto.res;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DtoResPlanningSettings {

    private Integer id;
    private String uuid;
    private String name;
    private String description;
    private Integer periodsPerDay;
    private Integer daysPerWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String organizationId;
    private String category;
    private List<DtoResTimeBlockType> timeBlockTypes;
    private Integer createdBy;
    private Integer modifiedBy;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
    private java.time.LocalDate planStartDate;
    private java.time.LocalDate planEndDate;
    private Boolean includeWeekends = true;
    private Integer maxControlNumber;
}