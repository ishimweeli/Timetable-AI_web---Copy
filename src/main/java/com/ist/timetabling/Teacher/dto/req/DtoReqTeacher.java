package com.ist.timetabling.Teacher.dto.req;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalTime;
import java.util.List;

@Data
public class DtoReqTeacher {
    private String email;
    private String phone;
    private String firstName;
    private String lastName;
    private Integer statusId;
    private String password;
    private String initials;
    private String department;
    private String qualification;
    private String contractType;
    private Integer controlNumber;
    private String notes;
    private Integer organizationId;
    private Integer planSettingsId;
    private String bio;
    private Integer maxDailyHours;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime preferredStartTime;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime preferredEndTime;


    private Integer primarySchedulePreferenceId;


    private List<Integer> schedulePreferenceIds;
}
