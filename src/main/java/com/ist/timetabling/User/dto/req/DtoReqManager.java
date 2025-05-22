package com.ist.timetabling.User.dto.req;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DtoReqManager {
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String phone;

    private String password;

    @NotNull(message = "Organization ID is required")
    private Integer organizationId;

    private Integer statusId;

    private Boolean canGenerateTimetable;

    private Boolean canManageTeachers;

    private Boolean canManageStudents;

    private Boolean canCreateManagers;
}