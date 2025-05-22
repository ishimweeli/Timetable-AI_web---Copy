package com.ist.timetabling.Timetable.dto.res;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DtoResTimetableEntry {
    private Integer id;
    private String uuid;
    private Integer timetableId;
    private Integer dayOfWeek;
    private Integer period;
    private Integer subjectId;
    private String subjectUuid;
    private String subjectName;
    private String subjectColor;
    private String subjectInitials;
    private Integer teacherId;
    private String teacherUuid;
    private String teacherName;
    private String teacherInitials;
    private Integer roomId;
    private String roomUuid;
    private String roomName;
    private String roomInitials;
    private Integer classId;
    private String classUuid;
    private String className;
    private String classInitials;
    private Integer durationMinutes;
    private String periodType;
    private String status;
    private Integer classBandId;
    private String classBandUuid;
    private String classBandName;
    private Boolean isClassBandEntry;
    private Boolean isLocked;
    private Boolean isDeleted;
}
