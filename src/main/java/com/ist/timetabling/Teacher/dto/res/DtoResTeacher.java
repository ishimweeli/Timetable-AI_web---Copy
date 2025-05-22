package com.ist.timetabling.Teacher.dto.res;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ist.timetabling.Period.dto.res.DtoResSchedulePreference;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
public class DtoResTeacher {
    private Integer id;
    private String uuid;
    private String email;
    private String phone;
    private String firstName;
    private String lastName;
    private Integer organizationId;
    private Integer planSettingsId;
    private String department;
    private Integer statusId;
    private Boolean isActive;
    private Boolean isDeleted;
    private String role;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime modifiedDate;

    private String initials;
    private String qualification;
    private String contractType;
    private Integer controlNumber;
    private String notes;
    private String bio;
    private Integer maxDailyHours;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime preferredStartTime;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime preferredEndTime;


    private DtoResSchedulePreference primarySchedulePreference;


    private List<DtoResSchedulePreference> schedulePreferences;

    private String generatedPassword;

}
