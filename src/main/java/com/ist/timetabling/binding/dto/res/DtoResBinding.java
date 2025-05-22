package com.ist.timetabling.binding.dto.res;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DtoResBinding {

    private String uuid;
    private Integer id;
    private String organizationUuid;
    private Integer organizationId;
    private String organizationName;

    private String teacherUuid;
    private Integer teacherId;
    private String teacherFirstName;
    private String teacherLastName;
    private String teacherFullName;

    private String subjectUuid;
    private Integer subjectId;
    private String subjectName;
    private String subjectInitials;

    private String classUuid;
    private Integer classId;
    private String className;
    private String classSection;

    private String classBandUuid;
    private Integer classBandId;
    private String classBandName;

    private String roomUuid;
    private Integer roomId;
    private String roomName;
    private String roomCode;

    private Integer periodsPerWeek;
    private Boolean isFixed;
    private Integer priority;
    private String notes;
    private Integer statusId;
    private List<String> ruleUuids;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
    private Integer planSettingsId;
}