package com.ist.timetabling.Timetable.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoResScheduleConflict {
    private String conflictType; // TEACHER, CLASS, ROOM
    private Integer resourceId; // Teacher ID, Class ID, or Room ID
    private String resourceName;
    private Integer bindingId;
    private Integer timetableEntryId;
    private Integer dayOfWeek;
    private Integer periodId;
    private String conflictDescription;
} 