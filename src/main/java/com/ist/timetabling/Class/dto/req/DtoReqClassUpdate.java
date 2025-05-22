package com.ist.timetabling.Class.dto.req;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoReqClassUpdate {

    @Size(min = 2, max = 100, message = "{class.name.size}")
    private String name;

    @Size(max = 5, message = "Initial must not exceed 5 characters")
    private String initial;

    private String color;

    private String section;

    @Min(value = 1, message = "{class.capacity.min}")
    @Max(value = 500, message = "{class.capacity.max}")
    private Integer capacity;

    private Integer locationId;

    private String comment;

    @Min(value = 0)
    private Integer minLessonsPerDay;

    @Min(value = 0)
    private Integer maxLessonsPerDay;

    @Min(value = 0)
    private Integer latestStartPosition;

    @Min(value = 0)
    private Integer earliestEnd;

    @Min(value = 0)
    private Integer maxFreePeriods;

    private String mainTeacher;

    private Boolean presentEveryDay;

    @Min(value = 0, message = "{class.status.invalid}")
    @Max(value = 1, message = "{class.status.invalid}")
    private Integer statusId;

    private Integer planSettingsId;
    private String modifiedBy;
    private Integer controlNumber;

}