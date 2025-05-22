package com.ist.timetabling.Core.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoResCoreDashboard {
    private long countUser;
    private long countAdmin;
    private long countManager;
    private long countStudent;
    private long countOrganization;
    private long countTimetable;
    private long countClass;
    private long countTeacher;
    // private long countCalendar;
    private long countRoom;
    private long countSubject;
    private long countRule;
}
