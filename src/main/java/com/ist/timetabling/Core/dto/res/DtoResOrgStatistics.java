package com.ist.timetabling.Core.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoResOrgStatistics {
    private long countUser;
    private long countStudent;
    private long countTeacher;
    private long countClass;
    private long countRoom;
    private long countSubject;
    private long countRule;
    private long countTimetable;
    private long countCalendar;
}
