package com.ist.timetabling.Period.dto.res;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DtoResPeriod {

    private Integer id;
    private String uuid;
    private Integer periodNumber;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationMinutes;
    private String periodType;
    private List<Integer> days;
    private Boolean allowScheduling;
    private Boolean showInTimetable;
    private Boolean allowConflicts;
    private Boolean allowLocationChange;
    private Integer organizationId;
    private Integer planSettingsId;
    private Integer statusId;
    private Boolean isDeleted;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
}
