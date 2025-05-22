package com.ist.timetabling.Class.dto.res;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoResClass {

    private Integer id;

    private Integer organizationId;

    private String uuid;

    private String name;

    private String initial;

    private String color;

    private String section;

    private Integer capacity;

    private Integer locationId;

    private String comment;

    private Integer minLessonsPerDay;

    private Integer maxLessonsPerDay;

    private Integer latestStartPosition;

    private Integer earliestEnd;

    private Integer maxFreePeriods;

    private String mainTeacher;

    private Boolean presentEveryDay;

    private Integer statusId;

    private String modifiedBy;
}
