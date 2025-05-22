package com.ist.timetabling.User.dto.res;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DtoResManager {
    private String uuid;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private Integer statusId;
    private Boolean isActive;
    private Boolean isDeleted;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
    private String role;
    private Integer organizationId;
    private Boolean canGenerateTimetable;
    private Boolean canManageTeachers;
    private Boolean canManageStudents;
    private Boolean canCreateManagers;
}